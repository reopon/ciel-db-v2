import Link from "next/link"
import type { Song } from "@/lib/types"

// Pure presentational table — no hooks, same split as SetlistView: the
// caller owns any modal state and passes onSongClick down (see
// SongListView for a single-table page, GroupedSongsView for multiple
// tables sharing one modal).
export function SongTable({
  songs,
  onSongClick,
}: {
  songs: Song[]
  onSongClick?: (e: React.MouseEvent, song: Song) => void
}) {
  return (
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
                <Link
                  href={`/music/${song.slug}`}
                  onClick={onSongClick ? (e) => onSongClick(e, song) : undefined}
                  className="font-medium text-brand underline underline-offset-2 decoration-brand/40 hover:decoration-brand"
                >
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
  )
}
