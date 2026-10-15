import Link from "next/link"
import { notFound } from "next/navigation"
import { fetchEvents } from "@/lib/events"
import { EventCard } from "@/components/EventCard"

export const dynamic = "force-dynamic"

export default async function MonthArchivePage({
  params,
}: {
  params: Promise<{ year: string; month: string }>
}) {
  const { year, month } = await params
  const monthNum = Number(month)

  if (!/^\d{4}$/.test(year) || !Number.isInteger(monthNum) || monthNum < 1 || monthNum > 12) {
    notFound()
  }

  const monthPadded = String(monthNum).padStart(2, "0")
  const events = await fetchEvents()
  const monthEvents = events.filter(
    (e) => e.date.slice(0, 4) === year && e.date.slice(5, 7) === monthPadded
  )

  const prevDate = new Date(Number(year), monthNum - 2, 1)
  const nextDate = new Date(Number(year), monthNum, 1)
  const prev = { year: prevDate.getFullYear(), month: prevDate.getMonth() + 1 }
  const next = { year: nextDate.getFullYear(), month: nextDate.getMonth() + 1 }

  return (
    <main className="max-w-3xl mx-auto px-4 py-8 space-y-8">
      <div className="flex items-center justify-between">
        <Link href={`/archive/${prev.year}/${prev.month}`} className="text-sm text-muted-foreground hover:underline">
          ← {prev.year}年{prev.month}月
        </Link>
        <h1 className="text-2xl font-display tracking-wide font-semibold">
          {year}年{monthNum}月
        </h1>
        <Link href={`/archive/${next.year}/${next.month}`} className="text-sm text-muted-foreground hover:underline">
          {next.year}年{next.month}月 →
        </Link>
      </div>

      {monthEvents.length === 0 ? (
        <p className="text-sm text-muted-foreground">この月の公演情報はありません</p>
      ) : (
        <div className="space-y-4">
          {monthEvents.map((event) => (
            <EventCard key={event.id} event={event} />
          ))}
        </div>
      )}

      <div className="pt-4 border-t">
        <Link href="/archive" className="text-sm text-muted-foreground hover:underline">
          ← アーカイブ一覧(検索)に戻る
        </Link>
      </div>
    </main>
  )
}
