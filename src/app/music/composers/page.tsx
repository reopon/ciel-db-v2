import { GroupedSongs } from "@/components/GroupedSongs"

export const revalidate = 0

export default function ComposersPage() {
  return <GroupedSongs field="composer" pageTitle="作曲家別楽曲一覧" />
}
