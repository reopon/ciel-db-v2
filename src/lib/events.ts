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
  id, event_name, date, notes, stage_costume,
  venue:venues ( id, name ),
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

export async function fetchVenuesForPicker(): Promise<Venue[]> {
  const supabase = getSupabaseClient()
  const { data, error } = await supabase.from("venues").select("id, name").order("name", { ascending: true })

  if (error) {
    console.error(error)
    return []
  }
  return data
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
