export interface Song {
  id: number
  title: string
  release_date: string
  lyricist: string | null
  composer: string | null
  arranger: string | null
  choreographer: string | null
  notes: string | null
}

export interface SetlistEntry {
  order: number
  note_before: string | null
  note_after: string | null
  song: Song
}

export interface Event {
  id: number
  event_name: string
  date: string
  location: string | null
  notes: string | null
}

export interface EventWithSetlist extends Event {
  setlist: SetlistEntry[]
  linkUrls: string[]
}
