"use client"

import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { SongModal, useSongModal } from "@/components/SongModal"
import type { Song } from "@/lib/types"

export type GroupField = "composer" | "lyricist" | "arranger" | "choreographer"

const FIELD_LABEL: Record<GroupField, string> = {
  composer: "作曲",
  lyricist: "作詞",
  arranger: "編曲",
  choreographer: "振付",
}

// Natural credit order; the page's own field is filtered out below so each
// song's secondary line shows every *other* credit instead of just one.
const FIELD_DISPLAY_ORDER: GroupField[] = ["lyricist", "composer", "arranger", "choreographer"]

export function GroupedSongsView({ field, groups }: { field: GroupField; groups: [string, Song[]][] }) {
  const { selectedSong, handleSongClick, closeModal } = useSongModal()
  const otherFields = FIELD_DISPLAY_ORDER.filter((f) => f !== field)

  return (
    <>
      <div className="space-y-6">
        {groups.map(([name, songs]) => (
          <Card key={name}>
            <CardHeader>
              <CardTitle className="text-base">
                {name} ({songs.length}曲)
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 gap-2">
                {songs.map((song) => (
                  <Link
                    key={song.id}
                    href={`/music/${song.slug}`}
                    onClick={(e) => handleSongClick(e, song)}
                    className="p-2 rounded-md border hover:bg-accent/50 block"
                  >
                    <div className="font-medium text-sm text-brand">{song.title}</div>
                    <div className="text-xs text-muted-foreground">
                      {otherFields.map((f) => `${FIELD_LABEL[f]}: ${song[f] || "-"}`).join(" / ")}
                    </div>
                  </Link>
                ))}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <SongModal selectedSong={selectedSong} onOpenChange={(open) => !open && closeModal()} />
    </>
  )
}
