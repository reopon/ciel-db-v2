import Link from "next/link"
import { redirect } from "next/navigation"
import { fetchEventById, fetchEventsByDate } from "@/lib/events"
import { formatDate } from "@/lib/format"

export const dynamic = "force-dynamic"

const inputClass =
  "w-full p-2 rounded-md border bg-background text-sm outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50"

export default async function EventLookupPage({
  searchParams,
}: {
  searchParams: Promise<{ id?: string; date?: string }>
}) {
  const { id, date } = await searchParams

  let idNotFound = false
  if (id) {
    const event = await fetchEventById(Number(id))
    if (event) redirect(`/events/${event.id}/edit`)
    idNotFound = true
  }

  let dateMatches: Awaited<ReturnType<typeof fetchEventsByDate>> = []
  if (date) {
    dateMatches = await fetchEventsByDate(date)
    if (dateMatches.length === 1) redirect(`/events/${dateMatches[0].id}/edit`)
  }

  return (
    <main className="max-w-xl mx-auto px-4 py-10 space-y-8">
      <h1 className="text-2xl font-display tracking-wide font-semibold">イベント編集 - 検索</h1>

      <form method="get" className="space-y-2">
        <label className="block text-sm font-medium">イベントIDで検索</label>
        <div className="flex gap-2">
          <input name="id" type="number" className={inputClass} defaultValue={id ?? ""} />
          <button type="submit" className="px-4 py-2 rounded-md border text-sm font-medium hover:bg-accent shrink-0">
            検索
          </button>
        </div>
        {idNotFound && <p className="text-sm text-destructive">イベントID {id} は見つかりませんでした</p>}
      </form>

      <form method="get" className="space-y-2">
        <label className="block text-sm font-medium">日付で検索</label>
        <div className="flex gap-2">
          <input name="date" type="date" className={inputClass} defaultValue={date ?? ""} />
          <button type="submit" className="px-4 py-2 rounded-md border text-sm font-medium hover:bg-accent shrink-0">
            検索
          </button>
        </div>
        {date && dateMatches.length === 0 && (
          <p className="text-sm text-destructive">{formatDate(date)} のイベントは見つかりませんでした</p>
        )}
        {date && dateMatches.length > 1 && (
          <ul className="space-y-1 pt-2">
            {dateMatches.map((e) => (
              <li key={e.id}>
                <Link
                  href={`/events/${e.id}/edit`}
                  className="block p-2 rounded-md border hover:bg-accent/50 text-sm"
                >
                  <span className="font-medium">{e.event_name}</span>
                  <span className="text-muted-foreground"> @ {e.venue?.name || "場所不明"}</span>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </form>
    </main>
  )
}
