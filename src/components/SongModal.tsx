"use client"

import { useState } from "react"
import Link from "next/link"
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog"
import { LinkPreviewListClient } from "@/components/LinkPreviewListClient"
import { fetchRecentSongPerformancesAction, fetchSongLinksAction } from "@/actions/songs"
import { formatDate } from "@/lib/format"
import type { SongPerformance } from "@/lib/songs"
import type { Song } from "@/lib/types"

interface SelectedSong {
  song: Song
  performances: SongPerformance[] | null // null while loading
  linkUrls: string[] | null // null while loading
}

// Shared "zap" pattern: clicking a song name opens a modal with its info +
// recent performances instead of navigating straight to /music/[slug].
// Used by InteractiveSetlist (event setlists) and the /music collection
// views (SongTable, GroupedSongsView). Each caller owns its own instance of
// this hook, so modal state resets independently per usage.
export function useSongModal() {
  const [selectedSong, setSelectedSong] = useState<SelectedSong | null>(null)

  const handleSongClick = (e: React.MouseEvent, song: Song) => {
    if (e.metaKey || e.ctrlKey || e.shiftKey) return
    e.preventDefault()
    setSelectedSong({ song, performances: null, linkUrls: null })
    fetchRecentSongPerformancesAction(song.id).then((performances) => {
      setSelectedSong((current) => {
        if (!current || current.song.id !== song.id) return current
        return { ...current, performances }
      })
    })
    fetchSongLinksAction(song.id).then((linkUrls) => {
      setSelectedSong((current) => {
        if (!current || current.song.id !== song.id) return current
        return { ...current, linkUrls }
      })
    })
  }

  const closeModal = () => setSelectedSong(null)

  return { selectedSong, handleSongClick, closeModal }
}

export function SongModal({
  selectedSong,
  onOpenChange,
}: {
  selectedSong: SelectedSong | null
  onOpenChange: (open: boolean) => void
}) {
  return (
    <Dialog open={selectedSong != null} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-sm">
        {selectedSong && (
          <>
            <DialogTitle className="text-base">{selectedSong.song.title}</DialogTitle>

            <dl className="text-sm grid grid-cols-[4.5rem_1fr] gap-y-1">
              <dt className="text-muted-foreground">発売日</dt>
              <dd>{formatDate(selectedSong.song.release_date)}</dd>
              <dt className="text-muted-foreground">作詞</dt>
              <dd>{selectedSong.song.lyricist || "-"}</dd>
              <dt className="text-muted-foreground">作曲</dt>
              <dd>{selectedSong.song.composer || "-"}</dd>
              <dt className="text-muted-foreground">編曲</dt>
              <dd>{selectedSong.song.arranger || "-"}</dd>
              <dt className="text-muted-foreground">振付</dt>
              <dd>{selectedSong.song.choreographer || "-"}</dd>
            </dl>

            <LinkPreviewListClient urls={selectedSong.linkUrls ?? []} />

            <div className="space-y-2 pt-3 border-t">
              {selectedSong.performances == null ? (
                <p className="text-sm text-muted-foreground">読み込み中...</p>
              ) : selectedSong.performances.length === 0 ? (
                <p className="text-sm text-muted-foreground">披露履歴はまだ登録されていません</p>
              ) : (
                <>
                  <p className="text-xs text-muted-foreground">直近{selectedSong.performances.length}回の披露履歴</p>
                  <ul className="divide-y rounded-md border text-sm">
                    {selectedSong.performances.map((p) => (
                      <li key={p.id} className="p-2">
                        <div>{formatDate(p.date)}</div>
                        <div className="text-muted-foreground text-xs">
                          {p.event_name} @ {p.venue?.name || "場所不明"}
                        </div>
                      </li>
                    ))}
                  </ul>
                </>
              )}
            </div>

            <div className="flex items-center justify-between gap-2">
              <Link
                href={`/music/${selectedSong.song.slug}`}
                className="text-xs text-muted-foreground hover:underline"
              >
                この曲の全履歴を見る →
              </Link>
              <Link
                href={`/music/edit/${selectedSong.song.slug}`}
                className="text-xs text-muted-foreground hover:underline shrink-0"
              >
                編集
              </Link>
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  )
}
