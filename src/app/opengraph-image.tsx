import { renderOgImage, OG_SIZE } from "@/lib/og-image"

export const runtime = "nodejs"
export const size = OG_SIZE
export const contentType = "image/png"

// Default OGP image for every page that doesn't define its own
// opengraph-image.tsx (events/[slug] and music/[slug] override this).
export default async function Image() {
  return renderOgImage({
    label: "SETLIST ARCHIVE",
    title: "Gran☆Ciel",
    meta: "セットリスト・公演アーカイブ",
  })
}
