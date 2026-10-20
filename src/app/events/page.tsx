import Link from "next/link"
import { fetchEvents, groupByYearMonth } from "@/lib/events"
import { Button } from "@/components/ui/button"
import { EventCard } from "@/components/EventCard"
import { monthKeyToLabel } from "@/lib/format"
import type { EventWithSetlist } from "@/lib/types"

export const dynamic = "force-dynamic"

export default async function EventsPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>
}) {
  const { q } = await searchParams
  const events = await fetchEvents()

  const filtered = events.filter((event) => {
    if (q) {
      const needle = q.toLowerCase()
      const haystack = [event.event_name, event.venue?.name ?? "", ...event.setlist.map((s) => s.song.title)]
        .join(" ")
        .toLowerCase()
      if (!haystack.includes(needle)) return false
    }
    return true
  })

  const grouped: [string, EventWithSetlist[]][] = groupByYearMonth(filtered)
  const hasFilter = Boolean(q)

  return (
    <main className="max-w-3xl mx-auto px-4 py-8 space-y-8">
      <h1 className="text-2xl font-display tracking-wide font-semibold">イベント</h1>

      <form className="flex flex-wrap gap-2 items-center" action="/events" method="get">
        <input
          type="search"
          name="q"
          defaultValue={q}
          placeholder="イベント名・曲名・会場名で検索"
          className="flex-1 min-w-40 h-9 px-3 rounded-md border bg-background text-sm outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50"
        />
        <Button type="submit" size="sm">
          検索
        </Button>
        {hasFilter && (
          <Button asChild type="button" variant="ghost" size="sm">
            <Link href="/events">クリア</Link>
          </Button>
        )}
      </form>

      {filtered.length === 0 && (
        <p className="text-sm text-muted-foreground">該当するイベントがありません</p>
      )}

      <div className="space-y-10">
        {grouped.map(([key, evts]) => (
          <section key={key}>
            <h2 className="text-sm font-semibold text-muted-foreground mb-3">{monthKeyToLabel(key)}</h2>
            <div className="space-y-4">
              {evts.map((event) => (
                <EventCard key={event.id} event={event} />
              ))}
            </div>
          </section>
        ))}
      </div>
    </main>
  )
}
