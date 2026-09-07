import Link from "next/link"
import { getSupabaseClient } from "@/lib/supabase"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { SetlistView } from "@/components/SetlistView"
import { EventLinks } from "@/components/EventLinks"
import { formatDate, yearMonthLabel } from "@/lib/format"
import type { Event, EventWithSetlist, Song } from "@/lib/types"

export const dynamic = "force-dynamic"

interface RawSetlistRow {
  order: number
  note_before: string | null
  note_after: string | null
  songs: Song
}

interface RawEventLink {
  url: string
  order: number
}

interface RawEvent extends Event {
  setlists: RawSetlistRow[]
  event_links: RawEventLink[]
}

async function fetchEvents(): Promise<EventWithSetlist[]> {
  const supabase = getSupabaseClient()
  const { data, error } = await supabase
    .from("events")
    .select(
      `
      id, event_name, date, location, notes,
      setlists (
        order, note_before, note_after,
        songs ( id, title, release_date, lyricist, composer, arranger, choreographer, notes )
      ),
      event_links ( url, order )
    `
    )
    .order("date", { ascending: false })

  if (error) {
    console.error(error)
    return []
  }

  return (data as unknown as RawEvent[]).map((event) => ({
    ...event,
    setlist: (event.setlists ?? [])
      .map((s) => ({
        order: s.order,
        note_before: s.note_before,
        note_after: s.note_after,
        song: s.songs,
      }))
      .sort((a, b) => a.order - b.order),
    linkUrls: (event.event_links ?? [])
      .slice()
      .sort((a, b) => a.order - b.order)
      .map((l) => l.url),
  }))
}

function groupByYearMonth(events: EventWithSetlist[]): [string, EventWithSetlist[]][] {
  const groups = new Map<string, EventWithSetlist[]>()
  for (const event of events) {
    const key = yearMonthLabel(event.date)
    if (!groups.has(key)) groups.set(key, [])
    groups.get(key)!.push(event)
  }
  return Array.from(groups.entries())
}

export default async function TopPage({
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

  const grouped = groupByYearMonth(filtered)
  const hasFilter = Boolean(q || year)

  return (
    <main className="max-w-3xl mx-auto px-4 py-8 space-y-8">
      <h1 className="text-2xl font-bold">Gran☆Ciel Setlists</h1>

      <form className="flex flex-wrap gap-2 items-center" action="/" method="get">
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
            <Link href="/">クリア</Link>
          </Button>
        )}
      </form>

      {filtered.length === 0 && (
        <p className="text-sm text-muted-foreground">該当するイベントがありません</p>
      )}

      <div className="space-y-10">
        {grouped.map(([ym, evts]) => (
          <section key={ym}>
            <h2 className="text-sm font-semibold text-muted-foreground mb-3">{ym}</h2>
            <div className="space-y-4">
              {evts.map((event) => (
                <Card key={event.id}>
                  <CardHeader>
                    <CardTitle className="text-base">{event.event_name}</CardTitle>
                    <CardDescription>
                      {formatDate(event.date)} @ {event.location || "場所不明"}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <SetlistView setlist={event.setlist} />
                    <EventLinks urls={event.linkUrls} />
                  </CardContent>
                </Card>
              ))}
            </div>
          </section>
        ))}
      </div>
    </main>
  )
}
