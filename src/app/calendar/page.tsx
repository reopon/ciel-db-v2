import { fetchEvents, groupByYearMonth } from "@/lib/events"
import { todayJstIso } from "@/lib/format"
import { CalendarMonthsList } from "@/components/CalendarMonthsList"

export const dynamic = "force-dynamic"

// groupByYearMonth only yields months that actually have events, so the
// current month may be missing from `grouped` entirely (no shows yet this
// month) — handled the same way the top page does, via an explicit fallback
// to an empty array rather than skipping the section.
export default async function CalendarPage() {
  const events = await fetchEvents()
  const grouped = groupByYearMonth(events)
  const currentKey = todayJstIso().slice(0, 7)

  const futureGroups = grouped.filter(([key]) => key > currentKey)
  const pastGroups = grouped.filter(([key]) => key < currentKey)
  const currentEvents = grouped.find(([key]) => key === currentKey)?.[1] ?? []

  return (
    <main className="max-w-3xl mx-auto px-4 py-8 space-y-8">
      <h1 className="text-2xl font-display tracking-wide font-semibold">カレンダー</h1>

      <CalendarMonthsList
        currentYear={Number(currentKey.slice(0, 4))}
        currentMonth={Number(currentKey.slice(5, 7))}
        currentEvents={currentEvents}
        futureGroups={futureGroups}
        pastGroups={pastGroups}
      />
    </main>
  )
}
