import type { Metadata } from "next"
import { fetchMonthRecap } from "@/lib/recap"
import { RecapStory, type RecapCard } from "@/components/RecapStory"

export const dynamic = "force-dynamic"

export const metadata: Metadata = {
  title: "2026年10月のまとめ | Gran☆Ciel Data",
  description: "Gran☆Cielの2026年10月をふりかえる",
}

function shortDate(isoDate: string): string {
  const [, month, day] = isoDate.split("-")
  return `${Number(month)}月${Number(day)}日`
}

export default async function OctoberRecapPage() {
  const recap = await fetchMonthRecap(2026, 10)

  const cards: RecapCard[] = [
    { big: "2026.10", sub: "Gran☆Cielの1ヶ月" },
    { kicker: "公演回数", big: `${recap.eventCount}`, sub: "公演" },
    { kicker: "披露した曲", big: `${recap.songCount}`, sub: "曲" },
  ]

  if (recap.topSong) {
    cards.push({ kicker: "一番披露した曲", big: recap.topSong.title, sub: `${recap.topSong.count}回披露` })
  }
  if (recap.firstSong) {
    cards.push({ kicker: "初めて披露した曲", big: recap.firstSong.title, sub: shortDate(recap.firstSong.date) })
  }
  if (recap.firstCostume) {
    cards.push({
      kicker: "初めて着た衣装",
      big: recap.firstCostume.name,
      sub: `${shortDate(recap.firstCostume.date)}〜`,
    })
  }

  cards.push({ big: "また来月", sub: "お疲れ様でした" })

  return <RecapStory cards={cards} backHref="/calendar/2026/10" />
}
