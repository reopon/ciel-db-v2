"use server"

import { fetchSongPerformances, fetchSongLinks, type SongPerformance } from "@/lib/songs"

// Used by the song "zap" modal (SongModal), which is a client component
// and so can't call the plain lib function directly.
export async function fetchRecentSongPerformancesAction(songId: number): Promise<SongPerformance[]> {
  return fetchSongPerformances(songId, 5)
}

// Same reason as above — SongModal needs this from client-side state.
export async function fetchSongLinksAction(songId: number): Promise<string[]> {
  return fetchSongLinks(songId)
}
