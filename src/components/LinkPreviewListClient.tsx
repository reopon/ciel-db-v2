"use client"

import { useEffect, useState } from "react"
import { LinkPreviewCard } from "@/components/LinkPreviewCard"
import { fetchLinkPreviewsAction } from "@/actions/link-previews"
import type { LinkPreview } from "@/lib/ogp"

// Client-side counterpart to LinkPreviewList (async Server Component —
// can't render inside a client-side modal tree). Fetches OGP previews via a
// Server Action on mount instead, showing plain links while loading so the
// modal isn't empty in the meantime. Shared by the calendar's event modal
// (MonthCalendar) and the song modal (SongModal).
//
// No reset-on-prop-change logic here: callers only mount this while their
// own modal is open (e.g. {selected && (...)}), so this component is
// freshly mounted each time a modal opens — same reasoning as
// InteractiveSetlist's song-modal state reset.
export function LinkPreviewListClient({ urls }: { urls: string[] }) {
  const [previews, setPreviews] = useState<LinkPreview[] | null>(null)

  useEffect(() => {
    if (urls.length === 0) return
    let cancelled = false
    fetchLinkPreviewsAction(urls).then((result) => {
      if (!cancelled) setPreviews(result)
    })
    return () => {
      cancelled = true
    }
  }, [urls])

  if (urls.length === 0) return null

  return (
    <div className="space-y-2 pt-3 mt-3 border-t">
      <h2 className="text-sm font-semibold text-muted-foreground">関連リンク</h2>
      {previews == null
        ? urls.map((url) => (
            <a
              key={url}
              href={url}
              target="_blank"
              rel="noopener noreferrer"
              className="block truncate text-sm text-brand underline underline-offset-2 decoration-brand/40 hover:decoration-brand"
            >
              {url}
            </a>
          ))
        : previews.map((preview) => <LinkPreviewCard key={preview.url} preview={preview} />)}
    </div>
  )
}
