"use client"

import { SongTable } from "@/components/SongTable"
import { SongModal, useSongModal } from "@/components/SongModal"
import type { Song } from "@/lib/types"

// Thin client wrapper pairing a single SongTable with its own song modal —
// used by the flat 発表順 view. GroupedSongsView does the equivalent for
// multiple per-group tables sharing one modal instead.
export function SongListView({ songs }: { songs: Song[] }) {
  const { selectedSong, handleSongClick, closeModal } = useSongModal()

  return (
    <>
      <SongTable songs={songs} onSongClick={handleSongClick} />
      <SongModal selectedSong={selectedSong} onOpenChange={(open) => !open && closeModal()} />
    </>
  )
}
