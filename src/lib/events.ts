import { getSupabaseClient } from "@/lib/supabase"
import type { Event, EventWithSetlist, Song, Venue } from "@/lib/types"

interface RawSetlistRow {
  order: number
  note_before: string | null
  note_after: string | null
  songs: Song
}

interface RawEventLink {
  url: string
  order: number
}

interface RawEvent extends Omit<Event, "venue"> {
  venue: Venue | null
  setlists: RawSetlistRow[]
  event_links: RawEventLink[]
}

const EVENT_SELECT = `
  id, slug, event_name, date, notes, stage_costume,
  venue:venues ( id, name, slug ),
  setlists (
    order, note_before, note_after,
    songs ( id, slug, title, release_date, lyricist, composer, arranger, choreographer, notes )
  ),
  event_links ( url, order )
`

function mapRawEvent(event: RawEvent): EventWithSetlist {
  return {
    ...event,
    setlist: (event.setlists ?? [])
      .map((s) => ({
        order: s.order,
        note_before: s.note_before,
        note_after: s.note_after,
        song: s.songs,
      }))
      .sort((a, b) => a.order - b.order),
    linkUrls: (event.event_links ?? [])
      .slice()
      .sort((a, b) => a.order - b.order)
      .map((l) => l.url),
  }
}

export async function fetchEvents(): Promise<EventWithSetlist[]> {
  const supabase = getSupabaseClient()
  const { data, error } = await supabase
    .from("events")
    .select(EVENT_SELECT)
    .order("date", { ascending: false })

  if (error) {
    console.error(error)
    return []
  }

  return (data as unknown as RawEvent[]).map(mapRawEvent)
}

export async function fetchEventById(id: number): Promise<EventWithSetlist | null> {
  const supabase = getSupabaseClient()
  const { data, error } = await supabase.from("events").select(EVENT_SELECT).eq("id", id).maybeSingle()

  if (error) {
    console.error(error)
    return null
  }
  if (!data) return null

  return mapRawEvent(data as unknown as RawEvent)
}

export async function fetchEventBySlug(slug: string): Promise<EventWithSetlist | null> {
  const supabase = getSupabaseClient()
  const { data, error } = await supabase.from("events").select(EVENT_SELECT).eq("slug", slug).maybeSingle()

  if (error) {
    console.error(error)
    return null
  }
  if (!data) return null

  return mapRawEvent(data as unknown as RawEvent)
}

export async function fetchEventsByDate(isoDate: string): Promise<EventWithSetlist[]> {
  const supabase = getSupabaseClient()
  const { data, error } = await supabase.from("events").select(EVENT_SELECT).eq("date", isoDate)

  if (error) {
    console.error(error)
    return []
  }

  return (data as unknown as RawEvent[]).map(mapRawEvent)
}

// For the setlist row picker on the event edit form. Deliberately NOT
// filtered by is_repertoire — cover/non-repertoire songs can still
// legitimately appear in a historical setlist, unlike the /music page
// which only lists the group's own current repertoire.
export async function fetchSongsForPicker(): Promise<Pick<Song, "id" | "slug" | "title">[]> {
  const supabase = getSupabaseClient()
  const { data, error } = await supabase
    .from("songs")
    .select("id, slug, title")
    .order("release_date", { ascending: true })
    .order("id", { ascending: true })

  if (error) {
    console.error(error)
    return []
  }
  return data
}

export async function fetchVenuesForPicker(): Promise<Pick<Venue, "id" | "name">[]> {
  const supabase = getSupabaseClient()
  const { data, error } = await supabase.from("venues").select("id, name").order("name", { ascending: true })

  if (error) {
    console.error(error)
    return []
  }
  return data
}

export async function fetchVenueBySlug(slug: string): Promise<Venue | null> {
  const supabase = getSupabaseClient()
  const { data, error } = await supabase
    .from("venues")
    .select("id, name, slug")
    .eq("slug", slug)
    .maybeSingle()

  if (error) {
    console.error(error)
    return null
  }
  return data
}

// For the /venues list page. Counting in JS (rather than a Postgrest
// embedded-count select) matches this codebase's existing preference for
// plain in-memory grouping (see groupByYearMonth, GroupedSongs.tsx) over
// cleverer single-query SQL — at ~120 venues / ~370 events this costs
// nothing.
export async function fetchVenuesWithEventCounts(): Promise<(Venue & { eventCount: number })[]> {
  const supabase = getSupabaseClient()
  const [{ data: venues, error: venueError }, { data: events, error: eventError }] = await Promise.all([
    supabase.from("venues").select("id, name, slug"),
    supabase.from("events").select("venue_id"),
  ])

  if (venueError || eventError) {
    console.error(venueError, eventError)
    return []
  }

  const counts = new Map<number, number>()
  for (const e of events) {
    if (e.venue_id == null) continue
    counts.set(e.venue_id, (counts.get(e.venue_id) ?? 0) + 1)
  }

  return venues
    .map((v) => ({ ...v, eventCount: counts.get(v.id) ?? 0 }))
    .sort((a, b) => b.eventCount - a.eventCount || a.name.localeCompare(b.name, "ja"))
}

export async function fetchEventsByVenueId(venueId: number): Promise<EventWithSetlist[]> {
  const supabase = getSupabaseClient()
  const { data, error } = await supabase
    .from("events")
    .select(EVENT_SELECT)
    .eq("venue_id", venueId)
    .order("date", { ascending: false })

  if (error) {
    console.error(error)
    return []
  }
  return (data as unknown as RawEvent[]).map(mapRawEvent)
}

// Resolves a free-text venue name to a venues.id, creating the row if it
// doesn't exist yet. Used by /register and /import, which both still
// accept arbitrary venue text (unlike the admin edit form's strict
// dropdown) — this is the one place new venues get created from free
// text, so it's where future spelling drift would creep back in if this
// helper didn't exist. A blank/whitespace-only name (e.g. the "no venue
// line found" case) resolves to null rather than creating a junk row.
export async function findOrCreateVenueId(
  supabase: ReturnType<typeof getSupabaseClient>,
  name: string
): Promise<number | null> {
  const trimmed = name.trim()
  if (!trimmed) return null

  const { data: existing, error: selectError } = await supabase
    .from("venues")
    .select("id")
    .eq("name", trimmed)
    .maybeSingle()

  if (selectError) {
    console.error(selectError)
    return null
  }
  if (existing) return existing.id

  const { data: created, error: insertError } = await supabase
    .from("venues")
    .insert([{ name: trimmed }])
    .select("id")
    .single()

  if (insertError) {
    console.error(insertError)
    return null
  }
  return created.id
}

export function groupByYearMonth(events: EventWithSetlist[]): [string, EventWithSetlist[]][] {
  const groups = new Map<string, EventWithSetlist[]>()
  for (const event of events) {
    const key = `${event.date.slice(0, 4)}-${event.date.slice(5, 7)}`
    if (!groups.has(key)) groups.set(key, [])
    groups.get(key)!.push(event)
  }
  return Array.from(groups.entries())
}
