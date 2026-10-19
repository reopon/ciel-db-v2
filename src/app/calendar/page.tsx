import Link from "next/link"
import { fetchEvents, groupByYearMonth } from "@/lib/events"
import { MonthCalendar } from "@/components/MonthCalendar"

export const dynamic = "force-dynamic"

// Unlike /events (search + EventCard list), this page is literally a stack
// of month-grid calendars, newest first — groupByYearMonth preserves the
// order events come in (fetchEvents sorts date desc), so no extra sort is
// needed here. Months with zero events simply don't appear (same behavior
// as the old combined archive page had).
export default async function CalendarPage() {
  const events = await fetchEvents()
  const grouped = groupByYearMonth(events)

  return (
    <main className="max-w-3xl mx-auto px-4 py-8 space-y-10">
      <h1 className="text-2xl font-display tracking-wide font-semibold">カレンダー</h1>

      {grouped.length === 0 && (
        <p className="text-sm text-muted-foreground">イベントがありません</p>
      )}

      <div className="space-y-10">
        {grouped.map(([key, monthEvents]) => {
          const [yearStr, monthStr] = key.split("-")
          const year = Number(yearStr)
          const month = Number(monthStr)
          return (
            <section key={key} className="space-y-3">
              <Link
                href={`/calendar/${year}/${month}`}
                className="text-sm font-semibold hover:underline"
              >
                {year}年{month}月
              </Link>
              <MonthCalendar year={year} month={month} events={monthEvents} />
            </section>
          )
        })}
      </div>
    </main>
  )
}
