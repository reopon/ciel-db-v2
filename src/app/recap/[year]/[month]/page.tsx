import type { Metadata } from "next"
import { notFound } from "next/navigation"
import { fetchMonthRecap, isRecapAvailable } from "@/lib/recap"
import { RecapStory, type RecapCard } from "@/components/RecapStory"

export const dynamic = "force-dynamic"

// Manually-curated photos for specific months' cards — not something
// fetchMonthRecap can infer (which photo "represents" a costume debut is
// a judgment call), so it's a small lookup rather than a DB column. Keyed
// "YYYY-M" (no zero-padding) -> costume-debut card image. Absent = the
// card just renders without a photo, same as any other month.
const FIRST_COSTUME_IMAGES: Record<string, string> = {
  "2026-10": "https://pbs.twimg.com/media/HULwSZmbcAANJfn?format=webp&name=large",
}

function parseParams(year: string, month: string): { year: number; month: number } | null {
  const yearNum = Number(year)
  const monthNum = Number(month)
  if (!/^\d{4}$/.test(year) || !Number.isInteger(monthNum) || monthNum < 1 || monthNum > 12) return null
  return { year: yearNum, month: monthNum }
}

function shortDate(isoDate: string): string {
  const [, month, day] = isoDate.split("-")
  return `${Number(month)}月${Number(day)}日`
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ year: string; month: string }>
}): Promise<Metadata> {
  const { year, month } = await params
  const parsed = parseParams(year, month)
  if (!parsed || !isRecapAvailable(parsed.year, parsed.month)) return {}

  const title = `${parsed.year}年${parsed.month}月のまとめ | Gran☆Ciel Data`
  const description = `Gran☆Cielの${parsed.year}年${parsed.month}月をふりかえる`
  return { title, description, openGraph: { title, description } }
}

export default async function MonthRecapPage({
  params,
}: {
  params: Promise<{ year: string; month: string }>
}) {
  const { year, month } = await params
  const parsed = parseParams(year, month)
  if (!parsed || !isRecapAvailable(parsed.year, parsed.month)) notFound()

  const recap = await fetchMonthRecap(parsed.year, parsed.month)

  const cards: RecapCard[] = [
    { big: `${parsed.year}.${String(parsed.month).padStart(2, "0")}`, sub: "Gran☆Cielの1ヶ月" },
    { kicker: "公演回数", big: `${recap.eventCount}`, sub: "公演" },
    { kicker: "披露した曲", big: `${recap.songCount}`, sub: "曲" },
  ]

  if (recap.topSongs.length > 0) {
    cards.push({ kicker: "披露回数ランキング", ranking: recap.topSongs })
  }
  if (recap.firstSong) {
    cards.push({ kicker: "初めて披露した曲", big: recap.firstSong.title, sub: shortDate(recap.firstSong.date) })
  }
  if (recap.firstCostume) {
    cards.push({
      kicker: "初めて着た衣装",
      big: recap.firstCostume.name,
      sub: `${shortDate(recap.firstCostume.date)}〜`,
      image: FIRST_COSTUME_IMAGES[`${parsed.year}-${parsed.month}`],
    })
  }

  cards.push({ big: "また来月", sub: "お疲れ様でした" })

  return <RecapStory cards={cards} backHref={`/calendar/${parsed.year}/${parsed.month}`} />
}
