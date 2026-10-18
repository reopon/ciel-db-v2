import Link from "next/link"
import { fetchEvents } from "@/lib/events"
import { EventCard } from "@/components/EventCard"
import { MonthCalendar } from "@/components/MonthCalendar"
import { todayJstIso } from "@/lib/format"

export const dynamic = "force-dynamic"

export default async function TopPage() {
  const events = await fetchEvents()
  const today = todayJstIso()
  const currentYear = today.slice(0, 4)
  const currentMonth = today.slice(5, 7)

  const thisMonthEvents = events.filter(
    (e) => e.date.slice(0, 4) === currentYear && e.date.slice(5, 7) === currentMonth
  )

  const monthLinks = new Map<string, { year: string; month: string }>()
  for (const e of events) {
    const year = e.date.slice(0, 4)
    const month = e.date.slice(5, 7)
    const key = `${year}-${month}`
    if (key === `${currentYear}-${currentMonth}`) continue
    if (!monthLinks.has(key)) monthLinks.set(key, { year, month })
  }
  const recentMonths = Array.from(monthLinks.entries())
    .sort((a, b) => b[0].localeCompare(a[0]))
    .slice(0, 12)

  return (
    <main className="max-w-3xl mx-auto px-4 py-8 space-y-8">
      <h1 className="text-2xl font-display tracking-wide font-semibold">
        {Number(currentYear)}年{Number(currentMonth)}月の公演
      </h1>

      <MonthCalendar year={Number(currentYear)} month={Number(currentMonth)} events={thisMonthEvents} />

      {thisMonthEvents.length === 0 ? (
        <p className="text-sm text-muted-foreground">今月の公演情報はまだありません</p>
      ) : (
        <div className="space-y-4">
          {thisMonthEvents.map((event) => (
            <EventCard key={event.id} event={event} />
          ))}
        </div>
      )}

      {recentMonths.length > 0 && (
        <section className="pt-6 border-t">
          <h2 className="text-sm font-semibold text-muted-foreground mb-3">過去の月を見る</h2>
          <div className="flex flex-wrap gap-2">
            {recentMonths.map(([key, { year, month }]) => (
              <Link
                key={key}
                href={`/archive/${year}/${Number(month)}`}
                className="px-3 py-1.5 rounded-md border text-sm hover:bg-accent/50"
              >
                {year}年{Number(month)}月
              </Link>
            ))}
          </div>
        </section>
      )}
    </main>
  )
}
