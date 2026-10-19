"use client"

import { useState } from "react"
import Link from "next/link"
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { SetlistView } from "@/components/SetlistView"
import { formatDate } from "@/lib/format"
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
  const [selected, setSelected] = useState<EventWithSetlist | null>(null)

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
  const prevHref = `/calendar/${prevDate.getFullYear()}/${prevDate.getMonth() + 1}`
  const nextHref = `/calendar/${nextDate.getFullYear()}/${nextDate.getMonth() + 1}`

  // Clicking an event opens it in a modal (for quick zapping between
  // events without leaving the calendar) instead of navigating away. The
  // href stays a real link to /events/[slug] so the permalink still works
  // for ctrl/cmd-click, middle-click, right-click-copy-link, and anyone
  // following a shared link directly.
  const handleEventClick = (e: React.MouseEvent, event: EventWithSetlist) => {
    if (e.metaKey || e.ctrlKey || e.shiftKey) return
    e.preventDefault()
    setSelected(event)
  }

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
                        href={`/events/${event.slug}`}
                        title={event.event_name}
                        onClick={(e) => handleEventClick(e, event)}
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

      {/* EventLinks (OGP preview cards) is an async Server Component, which
          can't render inside this client-side modal — it only works on the
          server-rendered /events/[slug] page. The modal shows plain link
          text instead, favoring a fast "quick zap" preview over rich
          previews; the OGP cards are one tap away via the permalink below. */}
      <Dialog open={selected != null} onOpenChange={(open) => !open && setSelected(null)}>
        <DialogContent className="max-w-xl">
          {selected && (
            <>
              <DialogTitle className="sr-only">{selected.event_name}</DialogTitle>
              <Card className="border-0 shadow-none p-0">
                <CardHeader className="px-0">
                  <CardTitle className="text-base">{selected.event_name}</CardTitle>
                  <CardDescription>
                    {formatDate(selected.date)} @ {selected.venue?.name || "場所不明"}
                  </CardDescription>
                </CardHeader>
                <CardContent className="px-0">
                  <SetlistView setlist={selected.setlist} />
                  {selected.linkUrls.length > 0 && (
                    <div className="space-y-1 pt-3 mt-3 border-t">
                      {selected.linkUrls.map((url) => (
                        <a
                          key={url}
                          href={url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="block truncate text-sm text-brand underline underline-offset-2 decoration-brand/40 hover:decoration-brand"
                        >
                          {url}
                        </a>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
              <Link
                href={`/events/${selected.slug}`}
                className="text-xs text-muted-foreground hover:underline"
              >
                このイベントのページを開く(共有用URL、リンクのプレビュー付き) →
              </Link>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
