import Link from "next/link"
import { notFound } from "next/navigation"
import { fetchEventBySlug } from "@/lib/events"
import { EventCard } from "@/components/EventCard"
import { formatDate } from "@/lib/format"
import type { Metadata } from "next"

export const dynamic = "force-dynamic"

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>
}): Promise<Metadata> {
  const { slug } = await params
  const event = await fetchEventBySlug(slug)
  if (!event) return {}

  const title = `${event.event_name} | Gran☆Ciel`
  const description = `${formatDate(event.date)} @ ${event.venue?.name ?? "場所未定"}`
  return {
    title,
    description,
    openGraph: { title, description },
    twitter: { card: "summary_large_image", title, description },
  }
}

export default async function EventDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const event = await fetchEventBySlug(slug)
  if (!event) notFound()

  return (
    <main className="max-w-xl mx-auto px-4 py-10 space-y-6">
      <div className="flex items-center justify-between gap-2">
        <Link
          href="/calendar"
          className="text-sm text-brand underline underline-offset-2 decoration-brand/40 hover:decoration-brand"
        >
          ← カレンダーに戻る
        </Link>
        <Link
          href={`/events/edit/${event.id}`}
          className="text-xs text-muted-foreground hover:underline shrink-0"
        >
          編集
        </Link>
      </div>
      <EventCard event={event} />
    </main>
  )
}
