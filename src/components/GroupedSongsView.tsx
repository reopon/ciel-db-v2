"use client"

import { SongTable } from "@/components/SongTable"
import { SongModal, useSongModal } from "@/components/SongModal"
import type { Song } from "@/lib/types"

export type GroupField = "composer" | "lyricist" | "arranger" | "choreographer"

export function GroupedSongsView({ groups }: { groups: [string, Song[]][] }) {
  const { selectedSong, handleSongClick, closeModal } = useSongModal()

  return (
    <>
      <div className="space-y-8">
        {groups.map(([name, songs]) => (
          <div key={name} className="space-y-2">
            <h2 className="text-base font-semibold">
              {name} ({songs.length}曲)
            </h2>
            <SongTable songs={songs} onSongClick={handleSongClick} />
          </div>
        ))}
      </div>

      <SongModal selectedSong={selectedSong} onOpenChange={(open) => !open && closeModal()} />
    </>
  )
}
