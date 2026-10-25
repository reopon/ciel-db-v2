"use client"

import { useEffect, useState } from "react"
import { LinkPreviewCard } from "@/components/LinkPreviewCard"
import { fetchLinkPreviewsAction } from "@/actions/link-previews"
import type { LinkPreview } from "@/lib/ogp"

// Client-side counterpart to EventLinks (async Server Component — can't
// render inside this client-side modal tree). Fetches OGP previews via a
// Server Action on mount instead, showing plain links while loading so the
// modal isn't empty in the meantime.
//
// No reset-on-prop-change logic here: the modal's Dialog content only
// exists while `selected` is non-null (see MonthCalendar), so this
// component is freshly mounted each time the modal opens for an event —
// same reasoning as InteractiveSetlist's song-modal state reset.
export function EventLinksClient({ urls }: { urls: string[] }) {
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
