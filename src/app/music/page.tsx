import Link from "next/link"
import { getSupabaseClient } from "@/lib/supabase"
import type { Song } from "@/lib/types"

export const dynamic = "force-dynamic"

async function fetchSongs(): Promise<Song[]> {
  const supabase = getSupabaseClient()
  const { data, error } = await supabase
    .from("songs")
    .select("*")
    .eq("is_repertoire", true)
    .order("release_date", { ascending: true })
    .order("id", { ascending: true })

  if (error) {
    console.error(error)
    return []
  }
  return data
}

export default async function MusicPage() {
  const songs = await fetchSongs()

  return (
    <main className="max-w-3xl mx-auto px-4 py-8 space-y-6">
      <h1 className="text-2xl font-bold">楽曲一覧</h1>

      <div className="overflow-x-auto rounded-md border">
        <table className="w-full text-sm">
          <thead className="bg-muted">
            <tr>
              <th className="p-2 text-left font-medium sticky left-0 bg-muted min-w-32">曲名</th>
              <th className="p-2 text-left font-medium min-w-24">作詞</th>
              <th className="p-2 text-left font-medium min-w-24">作曲</th>
              <th className="p-2 text-left font-medium min-w-24">編曲</th>
              <th className="p-2 text-left font-medium min-w-24">振付</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {songs.map((song) => (
              <tr key={song.id} className="hover:bg-accent/50">
                <td className="p-2 sticky left-0 bg-background">
                  <Link href={`/music/${song.id}`} className="font-medium hover:underline">
                    {song.title}
                  </Link>
                </td>
                <td className="p-2 text-muted-foreground">{song.lyricist || "-"}</td>
                <td className="p-2 text-muted-foreground">{song.composer || "-"}</td>
                <td className="p-2 text-muted-foreground">{song.arranger || "-"}</td>
                <td className="p-2 text-muted-foreground">{song.choreographer || "-"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </main>
  )
}
