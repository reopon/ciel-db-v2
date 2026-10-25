import { GroupedSongs } from "@/components/GroupedSongs"

export const dynamic = "force-dynamic"

export default function ComposersPage() {
  return <GroupedSongs field="composer" />
}
