import { getSupabaseClient } from "@/lib/supabase"
import type { Event, EventWithSetlist, Song } from "@/lib/types"

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

interface RawEvent extends Event {
  setlists: RawSetlistRow[]
  event_links: RawEventLink[]
}

export async function fetchEvents(): Promise<EventWithSetlist[]> {
  const supabase = getSupabaseClient()
  const { data, error } = await supabase
    .from("events")
    .select(
      `
      id, event_name, date, location, notes,
      setlists (
        order, note_before, note_after,
        songs ( id, title, release_date, lyricist, composer, arranger, choreographer, notes )
      ),
      event_links ( url, order )
    `
    )
    .order("date", { ascending: false })

  if (error) {
    console.error(error)
    return []
  }

  return (data as unknown as RawEvent[]).map((event) => ({
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
  }))
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
