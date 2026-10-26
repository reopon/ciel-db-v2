"use server"

import { fetchLinkPreview } from "@/lib/ogp"
import type { LinkPreview } from "@/lib/ogp"

// Used by LinkPreviewListClient (the calendar and song modals), which is a
// client component and so can't call fetchLinkPreview directly — same
// reason fetchRecentSongPerformancesAction exists for the song modal.
export async function fetchLinkPreviewsAction(urls: string[]): Promise<LinkPreview[]> {
  return Promise.all(urls.map((url) => fetchLinkPreview(url)))
}
