import { fetchEventBySlug } from "@/lib/events"
import { formatDate } from "@/lib/format"
import { renderOgImage, OG_SIZE } from "@/lib/og-image"

export const runtime = "nodejs"
export const size = OG_SIZE
export const contentType = "image/png"

export default async function Image({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const event = await fetchEventBySlug(slug)

  if (!event) {
    return renderOgImage({ label: "SETLIST", title: "Gran☆Ciel" })
  }

  return renderOgImage({
    label: "SETLIST",
    title: event.event_name,
    meta: `${formatDate(event.date)} ・ ${event.venue?.name ?? "場所未定"}`,
  })
}
