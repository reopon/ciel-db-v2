export interface Song {
  id: number
  slug: string
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

export interface Venue {
  id: number
  name: string
}

export interface Event {
  id: number
  event_name: string
  date: string
  venue: Venue | null
  notes: string | null
  stage_costume: string | null
}

export interface EventWithSetlist extends Event {
  setlist: SetlistEntry[]
  linkUrls: string[]
}

// Shared between the event edit form (client) and updateEventAction
// (server) — a "use server" file can only export async functions, so
// this type has to live here rather than alongside the action.
export interface SetlistRowPayload {
  songId: number
  noteBefore: string | null
  noteAfter: string | null
}
