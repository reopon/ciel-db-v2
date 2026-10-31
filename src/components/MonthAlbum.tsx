import { ExternalLink } from "lucide-react"
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
            className="block rounded-md overflow-hidden border bg-muted"
          >
            <div className="aspect-square">
              {/* eslint-disable-next-line @next/next/no-img-element -- arbitrary external domains (X, blogs, …), same as LinkPreviewImage */}
              <img
                src={preview.image}
                alt={preview.title ?? ""}
                className="w-full h-full object-cover"
                loading="lazy"
              />
            </div>
            {/* 写真を欠けさせず、出典と「押すとリンクが開く」ことだけを
                下の細いバーで示す(画像に重ねない) */}
            <div className="flex items-center justify-between gap-1 px-2 py-1 bg-background">
              <span className="text-[11px] font-semibold text-muted-foreground truncate">
                {hostnameOf(preview.url)}
              </span>
              <ExternalLink className="size-3 text-muted-foreground shrink-0" />
            </div>
          </a>
        ))}
      </div>
    </section>
  )
}

function hostnameOf(url: string): string {
  try {
    return new URL(url).hostname.replace(/^www\./, "")
  } catch {
    return url
  }
}
