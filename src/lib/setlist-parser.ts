// Shared setlist text parsing, used by both /import (parses a full pasted
// block) and /register (parses the "1行1曲" textarea) so the two pages
// don't duplicate the same rules.

export interface ParsedImportText {
  eventName: string
  location: string
  isoDate: string | null
  lines: string[]
}

// Parses the "#しえるセットリスト" style pasted text block:
//
//   2025.6.8(日)
//   HYPE IDOL！× AGE FES!
//   @ 品川グランドホール
//
//   #しえるセットリスト
//   Yakusoku
//   We Can
//   MC
//   僕らの未来へ
export function parseImportText(rawText: string): ParsedImportText {
  const lines = rawText
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean)

  const dateLineIndex = lines.findIndex((line) => /^\d{4}\.\d{1,2}\.\d{1,2}/.test(line))
  const locationLineIndex = lines.findIndex((line) => line.startsWith("@"))
  const setlistMarkerIndex = lines.findIndex((line) => line.startsWith("#"))

  let eventName = "無題イベント"
  if (dateLineIndex !== -1 && locationLineIndex !== -1 && locationLineIndex > dateLineIndex + 1) {
    eventName = lines.slice(dateLineIndex + 1, locationLineIndex).join(" ")
  } else if (dateLineIndex !== -1 && dateLineIndex + 1 < lines.length) {
    eventName = lines[dateLineIndex + 1]
  }

  const isoDate = dateLineIndex !== -1 ? toIsoDate(lines[dateLineIndex]) : null
  const location =
    locationLineIndex !== -1 ? lines[locationLineIndex].replace(/^@ ?/, "").trim() : "場所不明"

  const setlistLines = (setlistMarkerIndex !== -1 ? lines.slice(setlistMarkerIndex + 1) : [])
    .map((line) => line.replace(/^\d+\.?\s*/, "").trim())
    .filter((line) => line.length > 0)

  return { eventName, location, isoDate, lines: setlistLines }
}

function toIsoDate(dateLine: string): string | null {
  const match = dateLine.match(/^(\d{4})\.(\d{1,2})\.(\d{1,2})/)
  if (!match) return null
  const [, y, m, d] = match
  const month = Number(m)
  const day = Number(d)
  if (month < 1 || month > 12 || day < 1 || day > 31) return null
  return `${y}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`
}

// Splits a "1行1曲" textarea into cleaned, non-empty lines.
export function parseSetlistLines(text: string): string[] {
  return text
    .split("\n")
    .map((line) => line.replace(/^\d+\.?\s*/, "").trim())
    .filter((line) => line.length > 0)
}

export interface SetlistEntryInput {
  songId: number
  noteBefore: string | null
  noteAfter: string | null
}

export interface BuiltSetlist {
  entries: SetlistEntryInput[]
  unmatchedTitles: string[]
}

// Turns a flat list of lines into song-only setlist rows: a line that
// doesn't match a known song title is folded into the adjacent song's
// note_before/note_after instead of becoming its own row. This is what
// keeps song numbering (the row's "order") always a clean count with no
// gaps for MC/talk segments.
export function buildSetlistEntries(
  lines: string[],
  songIdByTitle: Map<string, number>
): BuiltSetlist {
  const entries: SetlistEntryInput[] = []
  const unmatchedTitles: string[] = []
  let pendingBefore: string[] = []

  for (const line of lines) {
    const songId = songIdByTitle.get(line)
    if (songId !== undefined) {
      entries.push({
        songId,
        noteBefore: pendingBefore.length > 0 ? pendingBefore.join(" / ") : null,
        noteAfter: null,
      })
      pendingBefore = []
      continue
    }

    unmatchedTitles.push(line)
    if (entries.length > 0) {
      const last = entries[entries.length - 1]
      last.noteAfter = last.noteAfter ? `${last.noteAfter} / ${line}` : line
    } else {
      pendingBefore.push(line)
    }
  }

  return { entries, unmatchedTitles }
}
