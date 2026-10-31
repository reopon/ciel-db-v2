import { fetchEvents, buildMonthLinks } from "@/lib/events"
import { EventCard } from "@/components/EventCard"
import { MonthCalendar } from "@/components/MonthCalendar"
import { MonthLinksSection } from "@/components/MonthLinksSection"
import { MemberCarousel } from "@/components/MemberCarousel"
import { MonthAlbum } from "@/components/MonthAlbum"
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
  const otherMonths = buildMonthLinks(events, `${currentYear}-${currentMonth}`)

  return (
    <main className="max-w-3xl mx-auto px-4 py-8 space-y-8">
      <MemberCarousel />

      <MonthCalendar year={Number(currentYear)} month={Number(currentMonth)} events={thisMonthEvents} />

      <MonthAlbum
        label={`${Number(currentMonth)}月のアルバム`}
        urls={thisMonthEvents.flatMap((e) => e.linkUrls)}
      />

      {thisMonthEvents.length === 0 ? (
        <p className="text-sm text-muted-foreground">今月の公演情報はまだありません</p>
      ) : (
        <div className="space-y-4">
          {thisMonthEvents.map((event) => (
            <EventCard key={event.id} event={event} />
          ))}
        </div>
      )}

      <MonthLinksSection label="他の月を見る" months={otherMonths} />
    </main>
  )
}
