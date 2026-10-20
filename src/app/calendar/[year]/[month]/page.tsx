import { notFound } from "next/navigation"
import { fetchEvents, buildMonthLinks } from "@/lib/events"
import { EventCard } from "@/components/EventCard"
import { MonthCalendar } from "@/components/MonthCalendar"
import { MonthLinksSection } from "@/components/MonthLinksSection"

export const dynamic = "force-dynamic"

export default async function MonthCalendarPage({
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
  const otherMonths = buildMonthLinks(events, `${year}-${monthPadded}`)

  return (
    <main className="max-w-3xl mx-auto px-4 py-8 space-y-8">
      <h1 className="text-2xl font-display tracking-wide font-semibold">
        {year}年{monthNum}月
      </h1>

      <MonthCalendar year={Number(year)} month={monthNum} events={monthEvents} />

      {monthEvents.length === 0 ? (
        <p className="text-sm text-muted-foreground">この月の公演情報はありません</p>
      ) : (
        <div className="space-y-4">
          {monthEvents.map((event) => (
            <EventCard key={event.id} event={event} />
          ))}
        </div>
      )}

      <MonthLinksSection label="他の月を見る" months={otherMonths} />
    </main>
  )
}
