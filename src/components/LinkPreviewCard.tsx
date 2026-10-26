import { LinkPreviewImage } from "@/components/LinkPreviewImage"
import type { LinkPreview } from "@/lib/ogp"

// Plain sync component (no hooks, no "use server"/"use client" needs) so it
// can be shared between LinkPreviewList (async Server Component, used by
// EventCard and /music/[slug]) and LinkPreviewListClient (the calendar and
// song modals' client-side equivalent) without either needing to import
// across the server/client boundary.
export function LinkPreviewCard({ preview }: { preview: LinkPreview }) {
  return (
    <a
      href={preview.url}
      target="_blank"
      rel="noopener noreferrer"
      className="flex items-center gap-3 p-2 rounded-md border hover:bg-accent/50 transition-colors"
    >
      {preview.image && <LinkPreviewImage src={preview.image} alt="" />}
      <div className="min-w-0 flex-1">
        <div className="text-sm font-medium text-brand truncate">{preview.title || preview.url}</div>
        {preview.description && (
          <div className="text-xs text-muted-foreground line-clamp-2">{preview.description}</div>
        )}
        <div className="text-xs text-muted-foreground truncate">
          {preview.siteName || new URL(preview.url).hostname}
        </div>
      </div>
    </a>
  )
}
