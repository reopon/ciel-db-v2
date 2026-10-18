import Link from "next/link"
import { notFound } from "next/navigation"
import { fetchEventById } from "@/lib/events"
import { EventCard } from "@/components/EventCard"

export const dynamic = "force-dynamic"

export default async function EventDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const event = await fetchEventById(Number(id))
  if (!event) notFound()

  return (
    <main className="max-w-xl mx-auto px-4 py-10 space-y-6">
      <Link
        href="/archive"
        className="text-sm text-brand underline underline-offset-2 decoration-brand/40 hover:decoration-brand"
      >
        ← アーカイブに戻る
      </Link>
      <EventCard event={event} />
    </main>
  )
}
