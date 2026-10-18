import Link from "next/link"
import type { EventWithSetlist } from "@/lib/types"

const WEEKDAY_LABELS = ["月", "火", "水", "木", "金", "土", "日"]

// Simple Mon-start month grid, same convention as TimeTree/Google Calendar.
// Only cells within the target month hold events; the leading/trailing
// padding cells from adjacent months are shown grayed-out and empty,
// matching how TimeTree itself renders a month view.
export function MonthCalendar({
  year,
  month,
  events,
}: {
  year: number
  month: number
  events: EventWithSetlist[]
}) {
  const firstOfMonth = new Date(year, month - 1, 1)
  const daysInMonth = new Date(year, month, 0).getDate()
  const firstWeekday = (firstOfMonth.getDay() + 6) % 7 // 0 = Mon ... 6 = Sun

  const eventsByDay = new Map<number, EventWithSetlist[]>()
  for (const event of events) {
    const day = Number(event.date.slice(8, 10))
    if (!eventsByDay.has(day)) eventsByDay.set(day, [])
    eventsByDay.get(day)!.push(event)
  }

  const totalCells = Math.ceil((firstWeekday + daysInMonth) / 7) * 7
  const days = Array.from({ length: totalCells }, (_, i) => {
    const day = i - firstWeekday + 1
    return day >= 1 && day <= daysInMonth ? day : null
  })

  const prevDate = new Date(year, month - 2, 1)
  const nextDate = new Date(year, month, 1)
  const prevHref = `/archive/${prevDate.getFullYear()}/${prevDate.getMonth() + 1}`
  const nextHref = `/archive/${nextDate.getFullYear()}/${nextDate.getMonth() + 1}`

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between text-sm">
        <Link href={prevHref} className="text-muted-foreground hover:underline">
          ← {prevDate.getFullYear()}年{prevDate.getMonth() + 1}月
        </Link>
        <Link href={nextHref} className="text-muted-foreground hover:underline">
          {nextDate.getFullYear()}年{nextDate.getMonth() + 1}月 →
        </Link>
      </div>
      <div className="rounded-md border overflow-hidden">
        <div className="grid grid-cols-7 divide-x bg-muted text-xs">
          {WEEKDAY_LABELS.map((w) => (
            <div key={w} className="p-1 sm:p-1.5 text-center font-medium text-muted-foreground">
              {w}
            </div>
          ))}
        </div>
        <div className="grid grid-cols-7 divide-x divide-y border-t">
          {days.map((day, i) => (
            <div key={i} className={`min-h-16 sm:min-h-24 p-0.5 sm:p-1 ${day == null ? "bg-muted/30" : ""}`}>
              {day != null && (
                <>
                  <div className="text-[10px] sm:text-xs text-muted-foreground mb-0.5">{day}</div>
                  <div className="space-y-0.5">
                    {(eventsByDay.get(day) ?? []).map((event) => (
                      <Link
                        key={event.id}
                        href={`/events/${event.id}`}
                        title={event.event_name}
                        className="block truncate text-[9px] sm:text-[11px] leading-tight px-0.5 sm:px-1 py-0.5 rounded bg-brand/10 text-brand hover:bg-brand/20"
                      >
                        {event.event_name}
                      </Link>
                    ))}
                  </div>
                </>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
