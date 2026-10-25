import { fetchRepertoireSongs } from "@/lib/songs"
import { SongTable } from "@/components/SongTable"

export const dynamic = "force-dynamic"

export default async function MusicPage() {
  const songs = await fetchRepertoireSongs()
  return <SongTable songs={songs} />
}
