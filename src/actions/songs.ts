"use server"

import { fetchSongPerformances, type SongPerformance } from "@/lib/songs"

// Used by the calendar's song "zap" modal (MonthCalendar), which is a
// client component and so can't call the plain lib function directly.
export async function fetchRecentSongPerformancesAction(songId: number): Promise<SongPerformance[]> {
  return fetchSongPerformances(songId, 5)
}
