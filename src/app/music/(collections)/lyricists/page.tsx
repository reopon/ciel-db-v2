import { GroupedSongs } from "@/components/GroupedSongs"

export const dynamic = "force-dynamic"

export default function LyricistsPage() {
  return <GroupedSongs field="lyricist" />
}
