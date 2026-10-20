"use client"

import { useState } from "react"
import Link from "next/link"
import { MonthCalendar } from "@/components/MonthCalendar"
import type { EventWithSetlist } from "@/lib/types"

type MonthGroup = [string, EventWithSetlist[]]

function MonthSection({ year, month, events }: { year: number; month: number; events: EventWithSetlist[] }) {
  return (
    <section className="space-y-3">
      <Link href={`/calendar/${year}/${month}`} className="text-sm font-semibold hover:underline">
        {year}年{month}月
      </Link>
      <MonthCalendar year={year} month={month} events={events} showNav={false} />
    </section>
  )
}

// Keeps the current month as the page's first visible section (the whole
// reason to come to /calendar — browsing month by month — doesn't benefit
// from future months with announced-but-distant events pushing it down).
// Future months are opt-in via a small toggle instead.
export function CalendarMonthsList({
  currentYear,
  currentMonth,
  currentEvents,
  futureGroups,
  pastGroups,
}: {
  currentYear: number
  currentMonth: number
  currentEvents: EventWithSetlist[]
  futureGroups: MonthGroup[]
  pastGroups: MonthGroup[]
}) {
  const [showFuture, setShowFuture] = useState(false)

  return (
    <div className="space-y-10">
      {showFuture &&
        futureGroups.map(([key, evts]) => {
          const [y, m] = key.split("-").map(Number)
          return <MonthSection key={key} year={y} month={m} events={evts} />
        })}

      <section className="space-y-3">
        <div className="flex items-center justify-between gap-2">
          <Link href={`/calendar/${currentYear}/${currentMonth}`} className="text-sm font-semibold hover:underline">
            {currentYear}年{currentMonth}月
          </Link>
          {futureGroups.length > 0 && (
            <button
              type="button"
              onClick={() => setShowFuture((v) => !v)}
              className="text-xs text-muted-foreground hover:underline shrink-0"
            >
              {showFuture ? "未来のカレンダーを隠す" : "未来のカレンダーを表示する"}
            </button>
          )}
        </div>
        <MonthCalendar year={currentYear} month={currentMonth} events={currentEvents} showNav={false} />
      </section>

      {pastGroups.map(([key, evts]) => {
        const [y, m] = key.split("-").map(Number)
        return <MonthSection key={key} year={y} month={m} events={evts} />
      })}
    </div>
  )
}
