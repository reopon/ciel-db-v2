import Link from "next/link"
import { notFound } from "next/navigation"
import { getSupabaseClient } from "@/lib/supabase"
import { formatDate } from "@/lib/format"
import type { Song } from "@/lib/types"

export const dynamic = "force-dynamic"

interface PerformedEvent {
  id: number
  event_name: string
  date: string
  location: string | null
}

async function fetchSong(id: number): Promise<Song | null> {
  const supabase = getSupabaseClient()
  const { data, error } = await supabase.from("songs").select("*").eq("id", id).single()
  if (error || !data) return null
  return data
}

async function fetchPerformances(songId: number): Promise<PerformedEvent[]> {
  const supabase = getSupabaseClient()
  const { data, error } = await supabase
    .from("setlists")
    .select("events ( id, event_name, date, location )")
    .eq("song_id", songId)

  if (error || !data) {
    console.error(error)
    return []
  }

  const events = (data as unknown as { events: PerformedEvent }[])
    .map((row) => row.events)
    .filter(Boolean)

  return events.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
}

export default async function SongDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const songId = Number(id)
  if (!Number.isInteger(songId)) notFound()

  const song = await fetchSong(songId)
  if (!song) notFound()

  const performances = await fetchPerformances(songId)

  return (
    <main className="max-w-xl mx-auto px-4 py-10 space-y-6">
      <Link href="/music" className="text-sm text-brand underline underline-offset-2 decoration-brand/40 hover:decoration-brand">
        ← 楽曲一覧に戻る
      </Link>

      <div className="space-y-2">
        <h1 className="text-2xl font-display tracking-wide font-semibold">{song.title}</h1>
        <p className="text-sm text-muted-foreground">
          発売日: {formatDate(song.release_date)}
        </p>
      </div>

      <dl className="text-sm grid grid-cols-[5rem_1fr] gap-y-1.5">
        <dt className="text-muted-foreground">作詞</dt>
        <dd>{song.lyricist || "-"}</dd>
        <dt className="text-muted-foreground">作曲</dt>
        <dd>{song.composer || "-"}</dd>
        <dt className="text-muted-foreground">編曲</dt>
        <dd>{song.arranger || "-"}</dd>
        <dt className="text-muted-foreground">振付</dt>
        <dd>{song.choreographer || "-"}</dd>
        {song.notes && (
          <>
            <dt className="text-muted-foreground">備考</dt>
            <dd>{song.notes}</dd>
          </>
        )}
      </dl>

      <div className="space-y-3">
        <h2 className="text-sm font-semibold text-muted-foreground">披露履歴 ({performances.length}回)</h2>
        {performances.length === 0 ? (
          <p className="text-sm text-muted-foreground">披露履歴はまだ登録されていません</p>
        ) : (
          <ul className="divide-y rounded-md border text-sm">
            {performances.map((event) => (
              <li key={event.id} className="p-2.5">
                <div>{formatDate(event.date)}</div>
                <div className="text-muted-foreground">
                  {event.event_name} @ {event.location || "-"}
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </main>
  )
}
