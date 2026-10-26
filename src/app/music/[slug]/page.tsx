import Link from "next/link"
import { notFound } from "next/navigation"
import { fetchSongPerformances, fetchSongBySlug, fetchSongLinks } from "@/lib/songs"
import { LinkPreviewList } from "@/components/LinkPreviewList"
import { formatDate } from "@/lib/format"
import type { Metadata } from "next"

export const dynamic = "force-dynamic"

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>
}): Promise<Metadata> {
  const { slug } = await params
  const song = await fetchSongBySlug(slug)
  if (!song) return {}

  const title = `${song.title} | Gran☆Ciel`
  const description = `発売日: ${formatDate(song.release_date)}${song.composer ? ` / 作曲: ${song.composer}` : ""}`
  return {
    title,
    description,
    openGraph: { title, description },
    twitter: { card: "summary_large_image", title, description },
  }
}

export default async function SongDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params

  const song = await fetchSongBySlug(slug)
  if (!song) notFound()

  const [performances, links] = await Promise.all([fetchSongPerformances(song.id), fetchSongLinks(song.id)])

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

      <LinkPreviewList urls={links} />

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
                  {event.event_name} @ {event.venue?.name || "-"}
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </main>
  )
}
