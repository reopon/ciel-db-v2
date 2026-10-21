import { getSupabaseClient } from "@/lib/supabase"
import type { Song, Venue } from "@/lib/types"

export async function fetchSongBySlug(slug: string): Promise<Song | null> {
  const supabase = getSupabaseClient()
  const { data, error } = await supabase.from("songs").select("*").eq("slug", slug).maybeSingle()
  if (error || !data) return null
  return data
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
