import { GroupedSongs } from "@/components/GroupedSongs"

export const dynamic = "force-dynamic"

export default function LyricistsPage() {
  return <GroupedSongs field="lyricist" pageTitle="作詞家別楽曲一覧" />
}
