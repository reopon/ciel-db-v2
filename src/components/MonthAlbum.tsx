import { ExternalLink } from "lucide-react"
import { fetchLinkPreview, fetchXPostImages, isXUrl } from "@/lib/ogp"

interface Tile {
  image: string
  postUrl: string
}

// Experimental "memories album" for the top page — a photo-grid pulled
// from that month's event_links (mostly X posts), image-first and
// text-light per the design brief, unlike LinkPreviewList/Card which
// shows title+description alongside the thumbnail.
export async function MonthAlbum({ label, urls }: { label: string; urls: string[] }) {
  const uniqueUrls = [...new Set(urls)]
  const tileLists = await Promise.all(uniqueUrls.map(tilesForUrl))
  const tiles = tileLists.flat()

  if (tiles.length === 0) return null

  return (
    <section className="space-y-3">
      <h2 className="text-sm font-medium text-muted-foreground">{label}</h2>
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
        {tiles.map((tile) => (
          <a
            key={tile.image}
            href={tile.postUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="block rounded-md overflow-hidden border bg-muted"
          >
            <div className="aspect-square">
              {/* eslint-disable-next-line @next/next/no-img-element -- arbitrary external domains (X, blogs, …), same as LinkPreviewImage */}
              <img src={tile.image} alt="" className="w-full h-full object-cover" loading="lazy" />
            </div>
            {/* 写真を欠けさせず、出典と「押すとリンクが開く」ことだけを
                下の細いバーで示す(画像に重ねない) */}
            <div className="flex items-center justify-between gap-1 px-2 py-1 bg-background">
              <span className="text-[11px] font-semibold text-muted-foreground truncate">
                {hostnameOf(tile.postUrl)}
              </span>
              <ExternalLink className="size-3 text-muted-foreground shrink-0" />
            </div>
          </a>
        ))}
      </div>
    </section>
  )
}

// X posts can carry several attached photos, all worth showing (unlike a
// generic og:image scrape, which only ever exposes one representative
// image per link) — those become one tile per photo, all linking back to
// the same post.
async function tilesForUrl(url: string): Promise<Tile[]> {
  if (isXUrl(url)) {
    const images = await fetchXPostImages(url)
    if (images.length > 0) return images.map((image) => ({ image, postUrl: url }))
    // No media ids found (text-only post, or the scrape came back empty) —
    // fall through to the generic og:image scrape below as a last resort.
  }

  const preview = await fetchLinkPreview(url)
  return preview.image ? [{ image: preview.image, postUrl: url }] : []
}

function hostnameOf(url: string): string {
  try {
    return new URL(url).hostname.replace(/^www\./, "")
  } catch {
    return url
  }
}
