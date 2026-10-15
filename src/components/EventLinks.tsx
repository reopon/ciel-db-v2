import { fetchLinkPreview } from "@/lib/ogp"
import { LinkPreviewImage } from "@/components/LinkPreviewImage"

export async function EventLinks({ urls }: { urls: string[] }) {
  if (urls.length === 0) return null

  const previews = await Promise.all(urls.map((url) => fetchLinkPreview(url)))

  return (
    <div className="space-y-2 pt-3 mt-3 border-t">
      {previews.map((preview) => (
        <a
          key={preview.url}
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
      ))}
    </div>
  )
}
