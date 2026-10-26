"use client"

import { SetlistView } from "@/components/SetlistView"
import { SongModal, useSongModal } from "@/components/SongModal"
import type { SetlistEntry } from "@/lib/types"

// Shared by EventCard (standalone, e.g. /archive, /events/[slug]) and
// MonthCalendar's event modal (nested inside its own Dialog). Owns its own
// song-modal state (via useSongModal) so each usage resets independently —
// in MonthCalendar this relies on the outer event Dialog unmounting its
// content (via {selected && (...)}) when closed, which discards this
// component's state along with it, no manual coordination needed.
export function InteractiveSetlist({ setlist }: { setlist: SetlistEntry[] }) {
  const { selectedSong, handleSongClick, closeModal } = useSongModal()

  return (
    <>
      <SetlistView setlist={setlist} onSongClick={handleSongClick} />
      <SongModal selectedSong={selectedSong} onOpenChange={(open) => !open && closeModal()} />
    </>
  )
}
