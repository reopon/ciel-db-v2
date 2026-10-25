import { GroupedSongs } from "@/components/GroupedSongs"

export const dynamic = "force-dynamic"

export default function ChoreographersPage() {
  return <GroupedSongs field="choreographer" />
}
