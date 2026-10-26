import { getSupabaseClient } from "@/lib/supabase"
import type { Song, Venue } from "@/lib/types"

export async function fetchSongBySlug(slug: string): Promise<Song | null> {
  const supabase = getSupabaseClient()
  const { data, error } = await supabase.from("songs").select("*").eq("slug", slug).maybeSingle()
  if (error || !data) return null
  return data
}

// Song ids that have at least one row in song_links, for the small "has
// related links" icon shown in /music's listing views (SongTable,
// GroupedSongsView). A plain id list + JS Set, same "simple aggregation
// over cleverer SQL" pattern as fetchVenuesWithEventCounts.
export async function fetchSongIdsWithLinks(): Promise<Set<number>> {
  const supabase = getSupabaseClient()
  const { data, error } = await supabase.from("song_links").select("song_id")

  if (error || !data) {
    console.error(error)
    return new Set()
  }
  return new Set(data.map((row) => row.song_id as number))
}

// For /music (発表順). is_repertoire filters out historical/cover songs
// that can still appear in a setlist but aren't part of the current lineup.
export async function fetchRepertoireSongs(): Promise<(Song & { hasLinks: boolean })[]> {
  const supabase = getSupabaseClient()
  const [{ data, error }, linkedIds] = await Promise.all([
    supabase
      .from("songs")
      .select("*")
      .eq("is_repertoire", true)
      .order("release_date", { ascending: true })
      .order("id", { ascending: true }),
    fetchSongIdsWithLinks(),
  ])

  if (error) {
    console.error(error)
    return []
  }
  return (data as Song[]).map((song) => ({ ...song, hasLinks: linkedIds.has(song.id) }))
}

export interface SongPerformance {
  id: number
  event_name: string
  date: string
  slug: string
  venue: Pick<Venue, "id" | "name" | "slug"> | null
}

interface RawPerformanceRow {
  events: SongPerformance
}

// Shared by the full song page (/music/[slug], no limit) and the calendar
// modal's song "zap" (limit 5, to keep the nested dialog from growing too
// tall). Counting/sorting in JS matches this codebase's existing preference
// for simple in-memory aggregation (groupByYearMonth, fetchVenuesWithEventCounts)
// over cleverer single-query SQL.
export async function fetchSongPerformances(songId: number, limit?: number): Promise<SongPerformance[]> {
  const supabase = getSupabaseClient()
  const { data, error } = await supabase
    .from("setlists")
    .select("events ( id, event_name, date, slug, venue:venues ( id, name, slug ) )")
    .eq("song_id", songId)

  if (error || !data) {
    console.error(error)
    return []
  }

  const events = (data as unknown as RawPerformanceRow[]).map((row) => row.events).filter(Boolean)
  const sorted = events.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
  return limit ? sorted.slice(0, limit) : sorted
}

interface RawSongLink {
  url: string
  order: number
}

// Shared by the full song page (/music/[slug]) and the song modal
// (via fetchSongLinksAction). "order" is a reserved word so, same as
// event_links in mapRawEvent, sorting is done in JS rather than via
// Postgrest's .order() on the column.
export async function fetchSongLinks(songId: number): Promise<string[]> {
  const supabase = getSupabaseClient()
  const { data, error } = await supabase.from("song_links").select("url, order").eq("song_id", songId)

  if (error || !data) {
    console.error(error)
    return []
  }

  return (data as RawSongLink[]).slice().sort((a, b) => a.order - b.order).map((l) => l.url)
}
