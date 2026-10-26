import { fetchRepertoireSongs } from "@/lib/songs"
import { SongListView } from "@/components/SongListView"

export const dynamic = "force-dynamic"

export default async function MusicPage() {
  const songs = await fetchRepertoireSongs()
  return <SongListView songs={songs} />
}
