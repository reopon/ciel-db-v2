import Link from "next/link"
import { fetchEvents, groupByYearMonth } from "@/lib/events"
import { Button } from "@/components/ui/button"
import { EventCard } from "@/components/EventCard"
import { monthKeyToLabel } from "@/lib/format"
import type { EventWithSetlist } from "@/lib/types"

export const dynamic = "force-dynamic"

export default async function ArchivePage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; year?: string }>
}) {
  const { q, year } = await searchParams
  const events = await fetchEvents()

  const years = Array.from(new Set(events.map((e) => e.date.slice(0, 4)))).sort().reverse()

  const filtered = events.filter((event) => {
    if (year && event.date.slice(0, 4) !== year) return false
    if (q) {
      const needle = q.toLowerCase()
      const haystack = [event.event_name, event.location ?? "", ...event.setlist.map((s) => s.song.title)]
        .join(" ")
        .toLowerCase()
      if (!haystack.includes(needle)) return false
    }
    return true
  })

  const grouped: [string, EventWithSetlist[]][] = groupByYearMonth(filtered)
  const hasFilter = Boolean(q || year)

  return (
    <main className="max-w-3xl mx-auto px-4 py-8 space-y-8">
      <h1 className="text-2xl font-display tracking-wide font-semibold">アーカイブ</h1>

      <form className="flex flex-wrap gap-2 items-center" action="/archive" method="get">
        <input
          type="search"
          name="q"
          defaultValue={q}
          placeholder="曲名・会場名で検索"
          className="flex-1 min-w-40 h-9 px-3 rounded-md border bg-background text-sm outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50"
        />
        <select
          name="year"
          defaultValue={year ?? ""}
          className="h-9 px-3 rounded-md border bg-background text-sm"
        >
          <option value="">全期間</option>
          {years.map((y) => (
            <option key={y} value={y}>
              {y}年
            </option>
          ))}
        </select>
        <Button type="submit" size="sm">
          検索
        </Button>
        {hasFilter && (
          <Button asChild type="button" variant="ghost" size="sm">
            <Link href="/archive">クリア</Link>
          </Button>
        )}
      </form>

      {filtered.length === 0 && (
        <p className="text-sm text-muted-foreground">該当するイベントがありません</p>
      )}

      <div className="space-y-10">
        {grouped.map(([key, evts]) => (
          <section key={key}>
            <div className="flex items-baseline justify-between mb-3">
              <h2 className="text-sm font-semibold text-muted-foreground">{monthKeyToLabel(key)}</h2>
              <Link
                href={`/archive/${key.split("-")[0]}/${Number(key.split("-")[1])}`}
                className="text-xs text-muted-foreground hover:underline"
              >
                この月だけのページ →
              </Link>
            </div>
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
