import { GroupedSongs } from "@/components/GroupedSongs"

export const revalidate = 0

export default function LyricistsPage() {
  return <GroupedSongs field="lyricist" pageTitle="作詞家別楽曲一覧" />
}
