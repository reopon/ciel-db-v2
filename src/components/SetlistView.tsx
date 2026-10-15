import Link from "next/link"
import { Badge } from "@/components/ui/badge"
import type { SetlistEntry } from "@/lib/types"

export function SetlistView({ setlist }: { setlist: SetlistEntry[] }) {
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
              href={`/music/${entry.song.id}`}
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
      <Badge variant="muted" className="font-normal">
        {text}
      </Badge>
    </div>
  )
}
