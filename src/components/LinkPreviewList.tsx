import { fetchLinkPreview } from "@/lib/ogp"
import { LinkPreviewCard } from "@/components/LinkPreviewCard"

// Generic "related URLs" renderer, shared by events (EventCard) and songs
// (/music/[slug]) — just a list of urls, OGP-previewed server-side.
export async function LinkPreviewList({ urls }: { urls: string[] }) {
  if (urls.length === 0) return null

  const previews = await Promise.all(urls.map((url) => fetchLinkPreview(url)))

  return (
    <div className="space-y-2 pt-3 mt-3 border-t">
      {previews.map((preview) => (
        <LinkPreviewCard key={preview.url} preview={preview} />
      ))}
    </div>
  )
}
