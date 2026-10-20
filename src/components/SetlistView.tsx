import Link from "next/link"
import { Badge } from "@/components/ui/badge"
import type { SetlistEntry, Song } from "@/lib/types"

// onSongClick is optional so the default usage (EventCard on the
// server-rendered pages) keeps plain navigation to /music/[slug]; only the
// calendar's modal passes a handler, matching the event-click "zap" pattern.
export function SetlistView({
  setlist,
  onSongClick,
}: {
  setlist: SetlistEntry[]
  onSongClick?: (e: React.MouseEvent, song: Song) => void
}) {
  if (setlist.length === 0) {
    return <p className="text-sm text-muted-foreground">セットリスト未登録</p>
  }

  return (
    <ol>
      {setlist.map((entry) => (
        <li key={entry.order}>
          {entry.note_before && <NoteLine text={entry.note_before} />}
          <div className="flex items-baseline gap-2 py-0.5">
            <span className="text-muted-foreground font-mono text-xs w-5 text-right shrink-0">
              {entry.order}
            </span>
            <Link
              href={`/music/${entry.song.slug}`}
              onClick={onSongClick ? (e) => onSongClick(e, entry.song) : undefined}
              className="text-sm text-brand underline underline-offset-2 decoration-brand/40 hover:decoration-brand"
            >
              {entry.song.title}
            </Link>
          </div>
          {entry.note_after && <NoteLine text={entry.note_after} />}
        </li>
      ))}
    </ol>
  )
}

function NoteLine({ text }: { text: string }) {
  return (
    <div className="pl-7 py-0.5">
      {/* Badge defaults to whitespace-nowrap (fine for short labels), but
          these notes are free text and can run long (e.g. multiple MC
          song titles joined together) — override to wrap instead of
          pushing the page into horizontal scroll. */}
      <Badge variant="muted" className="font-normal whitespace-normal break-words max-w-full">
        {text}
      </Badge>
    </div>
  )
}
