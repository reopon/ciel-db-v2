import Link from "next/link"
import { fetchSongBySlug, fetchSongLinks } from "@/lib/songs"
import { SongEditForm } from "@/components/SongEditForm"

export const dynamic = "force-dynamic"

export default async function SongEditPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const song = await fetchSongBySlug(slug)

  if (!song) {
    return (
      <main className="max-w-xl mx-auto px-4 py-10 space-y-4">
        <p className="text-sm text-muted-foreground">曲が見つかりませんでした</p>
        <Link href="/music" className="text-sm text-brand underline underline-offset-2 decoration-brand/40 hover:decoration-brand">
          楽曲一覧に戻る
        </Link>
      </main>
    )
  }

  const links = await fetchSongLinks(song.id)

  return (
    <main className="max-w-2xl mx-auto px-4 py-10 space-y-6">
      <div className="space-y-1">
        <h1 className="text-2xl font-display tracking-wide font-semibold">曲編集</h1>
        <Link
          href={`/music/${song.slug}`}
          className="text-sm text-brand underline underline-offset-2 decoration-brand/40 hover:decoration-brand"
        >
          曲のページに戻る
        </Link>
      </div>
      <SongEditForm song={song} links={links} />
    </main>
  )
}
