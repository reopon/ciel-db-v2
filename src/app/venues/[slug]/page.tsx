import Link from "next/link"
import { notFound } from "next/navigation"
import { fetchVenueBySlug, fetchEventsByVenueId } from "@/lib/events"
import { EventCard } from "@/components/EventCard"

export const dynamic = "force-dynamic"

export default async function VenueDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params

  const venue = await fetchVenueBySlug(slug)
  if (!venue) notFound()

  const events = await fetchEventsByVenueId(venue.id)

  return (
    <main className="max-w-3xl mx-auto px-4 py-10 space-y-6">
      <Link
        href="/venues"
        className="text-sm text-brand underline underline-offset-2 decoration-brand/40 hover:decoration-brand"
      >
        ← 会場一覧に戻る
      </Link>

      <h1 className="text-2xl font-display tracking-wide font-semibold">{venue.name}</h1>

      <div className="space-y-4">
        <h2 className="text-sm font-semibold text-muted-foreground">公演履歴 ({events.length}件)</h2>
        {events.length === 0 ? (
          <p className="text-sm text-muted-foreground">公演履歴はまだ登録されていません</p>
        ) : (
          <div className="space-y-4">
            {events.map((event) => (
              <EventCard key={event.id} event={event} />
            ))}
          </div>
        )}
      </div>
    </main>
  )
}
