import { fetchLinkPreview } from "@/lib/ogp"
import { LinkPreviewCard } from "@/components/LinkPreviewCard"

export async function EventLinks({ urls }: { urls: string[] }) {
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
