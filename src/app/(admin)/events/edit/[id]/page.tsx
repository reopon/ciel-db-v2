import Link from "next/link"
import { fetchEventById, fetchSongsForPicker, fetchVenuesForPicker } from "@/lib/events"
import { EventEditForm } from "@/components/EventEditForm"

export const dynamic = "force-dynamic"

export default async function EventEditPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const [event, songs, venues] = await Promise.all([
    fetchEventById(Number(id)),
    fetchSongsForPicker(),
    fetchVenuesForPicker(),
  ])

  if (!event) {
    return (
      <main className="max-w-xl mx-auto px-4 py-10 space-y-4">
        <p className="text-sm text-muted-foreground">イベントID {id} は見つかりませんでした</p>
        <Link href="/events/edit" className="text-sm text-brand underline underline-offset-2 decoration-brand/40 hover:decoration-brand">
          検索に戻る
        </Link>
      </main>
    )
  }

  return (
    <main className="max-w-2xl mx-auto px-4 py-10 space-y-6">
      <div className="space-y-1">
        <h1 className="text-2xl font-display tracking-wide font-semibold">イベント編集</h1>
        <Link href="/events/edit" className="text-sm text-brand underline underline-offset-2 decoration-brand/40 hover:decoration-brand">
          検索に戻る
        </Link>
      </div>
      <EventEditForm event={event} songs={songs} venues={venues} />
    </main>
  )
}
