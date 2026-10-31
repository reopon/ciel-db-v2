import { getSupabaseClient } from "@/lib/supabase"

// Months whose data has actually been checked for recap purposes (e.g.
// "初めて披露した曲/衣装" needs complete, correct setlist history for that
// month to be meaningful). Other months' data is incomplete/unverified, so
// /recap for them is kept inaccessible rather than showing wrong "firsts".
// Add a month here once its data has been verified.
const RECAP_AVAILABLE_MONTHS = new Set<string>(["2026-10"])

export function isRecapAvailable(year: number, month: number): boolean {
  return RECAP_AVAILABLE_MONTHS.has(`${year}-${month}`)
}

export interface MonthRecap {
  eventCount: number
  songCount: number
  topSongs: { title: string; count: number }[]
  firstSong: { title: string; date: string } | null
  firstCostume: { name: string; date: string } | null
}

function pad2(n: number): string {
  return String(n).padStart(2, "0")
}

// Not a generic "works for any month" engine — the recap concept (which
// stats matter, the story beats) is curated per month, this just does the
// counting/lookup work behind one such page. Real numbers, not hand-typed,
// so a late data correction doesn't leave the page quietly wrong.
export async function fetchMonthRecap(year: number, month: number): Promise<MonthRecap> {
  const supabase = getSupabaseClient()
  const from = `${year}-${pad2(month)}-01`
  const to = `${year}-${pad2(month)}-${pad2(new Date(year, month, 0).getDate())}`

  const { data: monthEvents } = await supabase
    .from("events")
    .select("id, date, stage_costume_id, stage_costumes ( name )")
    .gte("date", from)
    .lte("date", to)

  const eventIds = (monthEvents ?? []).map((e) => e.id)
  const eventCount = eventIds.length

  const { data: monthSetlists } = await supabase
    .from("setlists")
    .select("song_id, songs ( title )")
    .in("event_id", eventIds.length > 0 ? eventIds : [-1])

  const countBySong = new Map<number, { title: string; count: number }>()
  for (const row of monthSetlists ?? []) {
    const title = (row.songs as unknown as { title: string } | null)?.title
    if (!title) continue
    const existing = countBySong.get(row.song_id)
    if (existing) existing.count += 1
    else countBySong.set(row.song_id, { title, count: 1 })
  }

  const topSongs = [...countBySong.values()].sort((a, b) => b.count - a.count).slice(0, 5)

  // Global history (song → earliest performance date, costume → earliest
  // worn date), so "first time this month" can be told apart from "just
  // happens to be the only time it was done this month". setlists is
  // comfortably past Supabase's 1000-row default page size (2700+ rows and
  // growing), so this has to paginate — an unpaginated query silently
  // truncates to the oldest 1000 rows, which would make every song's
  // first-performance date look older than it really is.
  const allSetlists: { song_id: number; events: { date: string } | null }[] = []
  for (let offset = 0; ; offset += 1000) {
    const { data: page } = await supabase.from("setlists").select("song_id, events ( date )").range(offset, offset + 999)
    const typedPage = page as unknown as { song_id: number; events: { date: string } | null }[] | null
    if (!typedPage || typedPage.length === 0) break
    allSetlists.push(...typedPage)
    if (typedPage.length < 1000) break
  }
  const firstDateBySong = new Map<number, string>()
  for (const row of allSetlists) {
    const date = row.events?.date
    if (!date) continue
    const current = firstDateBySong.get(row.song_id)
    if (!current || date < current) firstDateBySong.set(row.song_id, date)
  }

  let firstSong: { title: string; date: string } | null = null
  for (const [songId, entry] of countBySong) {
    const firstDate = firstDateBySong.get(songId)
    if (firstDate && firstDate >= from && firstDate <= to) {
      firstSong = { title: entry.title, date: firstDate }
      break
    }
  }

  const { data: allCostumeEvents } = await supabase
    .from("events")
    .select("date, stage_costume_id, stage_costumes ( name )")
    .not("stage_costume_id", "is", null)
  const firstDateByCostume = new Map<number, { date: string; name: string }>()
  for (const row of allCostumeEvents ?? []) {
    if (row.stage_costume_id == null) continue
    const name = (row.stage_costumes as unknown as { name: string } | null)?.name
    if (!name) continue
    const current = firstDateByCostume.get(row.stage_costume_id)
    if (!current || row.date < current.date) firstDateByCostume.set(row.stage_costume_id, { date: row.date, name })
  }

  const costumeIdsThisMonth = new Set(
    (monthEvents ?? []).map((e) => e.stage_costume_id).filter((id): id is number => id != null)
  )
  let firstCostume: { name: string; date: string } | null = null
  for (const costumeId of costumeIdsThisMonth) {
    const entry = firstDateByCostume.get(costumeId)
    if (entry && entry.date >= from && entry.date <= to) {
      firstCostume = entry
      break
    }
  }

  return {
    eventCount,
    songCount: countBySong.size,
    topSongs,
    firstSong,
    firstCostume,
  }
}
