import { GroupedSongs } from "@/components/GroupedSongs"

export const dynamic = "force-dynamic"

export default function ArrangersPage() {
  return <GroupedSongs field="arranger" />
}
