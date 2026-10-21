import { fetchSongBySlug } from "@/lib/songs"
import { formatDate } from "@/lib/format"
import { renderOgImage, OG_SIZE } from "@/lib/og-image"

export const runtime = "nodejs"
export const size = OG_SIZE
export const contentType = "image/png"

export default async function Image({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const song = await fetchSongBySlug(slug)

  if (!song) {
    return renderOgImage({ label: "MUSIC", title: "Gran☆Ciel" })
  }

  return renderOgImage({
    label: "MUSIC",
    title: song.title,
    meta: `発売日: ${formatDate(song.release_date)}`,
  })
}
