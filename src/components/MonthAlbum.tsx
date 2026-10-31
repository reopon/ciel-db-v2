import { fetchLinkPreview, type LinkPreview } from "@/lib/ogp"

// Experimental "memories album" for the top page — a photo-grid pulled
// from that month's event_links (mostly X posts), image-first and
// text-light per the design brief, unlike LinkPreviewList/Card which
// shows title+description alongside the thumbnail.
export async function MonthAlbum({ label, urls }: { label: string; urls: string[] }) {
  const uniqueUrls = [...new Set(urls)]
  const previews = await Promise.all(uniqueUrls.map((url) => fetchLinkPreview(url)))
  const withImage = previews.filter((p): p is LinkPreview & { image: string } => p.image != null)

  if (withImage.length === 0) return null

  return (
    <section className="space-y-3">
      <h2 className="text-sm font-medium text-muted-foreground">{label}</h2>
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
        {withImage.map((preview) => (
          <a
            key={preview.url}
            href={preview.url}
            target="_blank"
            rel="noopener noreferrer"
            className="block aspect-square rounded-md overflow-hidden border bg-muted"
          >
            {/* eslint-disable-next-line @next/next/no-img-element -- arbitrary external domains (X, blogs, …), same as LinkPreviewImage */}
            <img
              src={preview.image}
              alt={preview.title ?? ""}
              className="w-full h-full object-cover"
              loading="lazy"
            />
          </a>
        ))}
      </div>
    </section>
  )
}
