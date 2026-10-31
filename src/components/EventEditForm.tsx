"use client"

import { useEffect, useRef, useState } from "react"
import { useActionState } from "react"
import { Button } from "@/components/ui/button"
import { Field } from "@/components/FormField"
import { updateEventAction } from "@/actions/event-edit"
import { initialActionState } from "@/lib/action-state"
import { inputClass, newKey, moveItem } from "@/lib/form-utils"
import type { EventWithSetlist, Song, SetlistRowPayload, StageCostume, Venue } from "@/lib/types"

interface RowState {
  key: string
  songId: number | null
  songTitle: string
  noteBefore: string
  noteAfter: string
  note: string
}

interface LinkState {
  key: string
  url: string
}

export function EventEditForm({
  event,
  songs,
  venues,
  stageCostumes,
}: {
  event: EventWithSetlist
  songs: Pick<Song, "id" | "slug" | "title">[]
  venues: Pick<Venue, "id" | "name">[]
  stageCostumes: Pick<StageCostume, "id" | "name">[]
}) {
  const [state, formAction, pending] = useActionState(updateEventAction, initialActionState)

  const [rows, setRows] = useState<RowState[]>(() =>
    event.setlist.map((entry) => ({
      key: newKey(),
      songId: entry.song.id,
      songTitle: entry.song.title,
      noteBefore: entry.note_before ?? "",
      noteAfter: entry.note_after ?? "",
      note: entry.note ?? "",
    }))
  )
  const [links, setLinks] = useState<LinkState[]>(() =>
    event.linkUrls.map((url) => ({ key: newKey(), url }))
  )

  const addRow = () =>
    setRows((rs) => [
      ...rs,
      { key: newKey(), songId: null, songTitle: "", noteBefore: "", noteAfter: "", note: "" },
    ])
  const removeRow = (key: string) => setRows((rs) => rs.filter((r) => r.key !== key))
  const moveRow = (key: string, dir: -1 | 1) =>
    setRows((rs) => moveItem(rs, rs.findIndex((r) => r.key === key), dir))
  const updateRow = (key: string, patch: Partial<RowState>) =>
    setRows((rs) => rs.map((r) => (r.key === key ? { ...r, ...patch } : r)))

  // The datalist only suggests titles — it doesn't constrain what gets
  // typed, unlike the <select> this replaces. Resolve to the matching
  // song's id on every keystroke; an unmatched title leaves songId null
  // (same as an unselected row) so it's dropped from setlistJson below
  // rather than silently saved against the wrong song.
  const updateRowSongTitle = (key: string, title: string) => {
    const match = songs.find((s) => s.title === title)
    updateRow(key, { songTitle: title, songId: match ? match.id : null })
  }

  const addLink = () => setLinks((ls) => [...ls, { key: newKey(), url: "" }])
  const removeLink = (key: string) => setLinks((ls) => ls.filter((l) => l.key !== key))
  const moveLink = (key: string, dir: -1 | 1) =>
    setLinks((ls) => moveItem(ls, ls.findIndex((l) => l.key === key), dir))
  const updateLink = (key: string, url: string) =>
    setLinks((ls) => ls.map((l) => (l.key === key ? { ...l, url } : l)))

  // Pasting several URLs at once (e.g. all 7 members' post links copied
  // together, one per line) expands into that many rows instead of
  // dumping them all into one field — saves clicking "+URLを追加" and
  // pasting one at a time. A single-URL paste falls through to the
  // browser's normal paste behavior.
  const pasteLinks = (key: string, text: string): boolean => {
    const urls = text
      .split(/\s+/)
      .map((s) => s.trim())
      .filter(Boolean)
    if (urls.length <= 1) return false
    setLinks((ls) => {
      const i = ls.findIndex((l) => l.key === key)
      if (i === -1) return ls
      const pasted = urls.map((url) => ({ key: newKey(), url }))
      return [...ls.slice(0, i), ...pasted, ...ls.slice(i + 1)]
    })
    return true
  }

  // Workaround for a React 19 quirk confirmed empirically: after a
  // successful <form action> submission, every <select> in the form gets
  // reset back to its SSR/mount-time default value — even though the save
  // itself succeeded and the underlying state is correct. Plain text
  // inputs (including the venue/song fields below, now datalist-backed
  // text inputs rather than <select>s) are unaffected — only the
  // remaining <select> (stage costume) still needs this.
  const stageCostumeSelectRef = useRef<HTMLSelectElement>(null)
  const stageCostumeValueRef = useRef(String(event.stage_costume?.id ?? ""))

  useEffect(() => {
    if (stageCostumeSelectRef.current) stageCostumeSelectRef.current.value = stageCostumeValueRef.current
  }, [state])

  const setlistJson = JSON.stringify(
    rows
      .filter((r) => r.songId != null)
      .map(
        (r): SetlistRowPayload => ({
          songId: r.songId!,
          noteBefore: r.noteBefore || null,
          noteAfter: r.noteAfter || null,
          note: r.note || null,
        })
      )
  )
  const linksJson = JSON.stringify(links.map((l) => l.url).filter(Boolean))

  return (
    <form action={formAction} className="space-y-8">
      <input type="hidden" name="eventId" value={event.id} readOnly />
      <input type="hidden" name="setlistJson" value={setlistJson} readOnly />
      <input type="hidden" name="linksJson" value={linksJson} readOnly />

      <section className="space-y-4">
        <Field label="イベント名">
          <input name="eventName" type="text" required defaultValue={event.event_name} className={inputClass} />
        </Field>
        <Field label="会場">
          <input
            name="venueName"
            type="text"
            list="venue-options"
            defaultValue={event.venue?.name ?? ""}
            className={inputClass}
          />
          <datalist id="venue-options">
            {venues.map((venue) => (
              <option key={venue.id} value={venue.name} />
            ))}
          </datalist>
        </Field>
        <Field label="日付">
          <input name="date" type="date" required defaultValue={event.date} className={inputClass} />
        </Field>
        <Field label="備考">
          <textarea name="note" rows={2} defaultValue={event.note ?? ""} className={inputClass} />
        </Field>
        <Field label="衣装">
          <select
            name="stageCostumeId"
            ref={stageCostumeSelectRef}
            defaultValue={event.stage_costume?.id ?? ""}
            onChange={(e) => {
              stageCostumeValueRef.current = e.target.value
            }}
            className={inputClass}
          >
            <option value="">選択してください</option>
            {stageCostumes.map((costume) => (
              <option key={costume.id} value={costume.id}>
                {costume.name}
              </option>
            ))}
          </select>
          <input
            name="newStageCostumeName"
            type="text"
            placeholder="新しい衣装を追加(入力すると上の選択より優先されます)"
            className={`${inputClass} mt-1.5`}
          />
        </Field>
        <Field label="表示順(同日内。空なら登録順)">
          <input
            name="displayOrder"
            type="number"
            defaultValue={event.display_order ?? ""}
            className={inputClass}
          />
        </Field>
      </section>

      <section className="space-y-3">
        <h2 className="text-sm font-semibold">セットリスト</h2>
        <div className="space-y-2">
          {rows.map((row, i) => (
            <div key={row.key} className="flex gap-2 items-start p-2 rounded-md border">
              <span className="text-xs font-mono text-muted-foreground w-5 text-right pt-2 shrink-0">
                {i + 1}
              </span>
              <div className="flex-1 space-y-1.5">
                <input
                  type="text"
                  list="song-options"
                  placeholder="曲名"
                  value={row.songTitle}
                  onChange={(e) => updateRowSongTitle(row.key, e.target.value)}
                  className={inputClass}
                />
                {row.songTitle && row.songId == null && (
                  <p className="text-xs text-destructive">曲名が一致しません(一覧から選んでください)</p>
                )}
                <input
                  type="text"
                  placeholder="曲名の補足(任意、例: メドレーver.)"
                  value={row.note}
                  onChange={(e) => updateRow(row.key, { note: e.target.value })}
                  className={inputClass}
                />
                <input
                  type="text"
                  placeholder="この曲の前のMC等(任意)"
                  value={row.noteBefore}
                  onChange={(e) => updateRow(row.key, { noteBefore: e.target.value })}
                  className={inputClass}
                />
                <input
                  type="text"
                  placeholder="この曲の後のMC等(任意)"
                  value={row.noteAfter}
                  onChange={(e) => updateRow(row.key, { noteAfter: e.target.value })}
                  className={inputClass}
                />
              </div>
              <div className="flex flex-col gap-1 shrink-0">
                <Button type="button" variant="outline" size="sm" onClick={() => moveRow(row.key, -1)} disabled={i === 0}>
                  ↑
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => moveRow(row.key, 1)}
                  disabled={i === rows.length - 1}
                >
                  ↓
                </Button>
                <Button type="button" variant="destructive" size="sm" onClick={() => removeRow(row.key)}>
                  削除
                </Button>
              </div>
            </div>
          ))}
        </div>
        <Button type="button" variant="outline" size="sm" onClick={addRow}>
          + 曲を追加
        </Button>
        <datalist id="song-options">
          {songs.map((song) => (
            <option key={song.id} value={song.title} />
          ))}
        </datalist>
      </section>

      <section className="space-y-3">
        <h2 className="text-sm font-semibold">関連URL</h2>
        <div className="space-y-2">
          {links.map((link, i) => (
            <div key={link.key} className="flex gap-2 items-center">
              <input
                type="url"
                placeholder="https://..."
                value={link.url}
                onChange={(e) => updateLink(link.key, e.target.value)}
                onPaste={(e) => {
                  if (pasteLinks(link.key, e.clipboardData.getData("text"))) e.preventDefault()
                }}
                className={inputClass}
              />
              <div className="flex gap-1 shrink-0">
                <Button type="button" variant="outline" size="sm" onClick={() => moveLink(link.key, -1)} disabled={i === 0}>
                  ↑
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => moveLink(link.key, 1)}
                  disabled={i === links.length - 1}
                >
                  ↓
                </Button>
                <Button type="button" variant="destructive" size="sm" onClick={() => removeLink(link.key)}>
                  削除
                </Button>
              </div>
            </div>
          ))}
        </div>
        <Button type="button" variant="outline" size="sm" onClick={addLink}>
          + URLを追加
        </Button>
      </section>

      <Button type="submit" disabled={pending}>
        {pending ? "保存中..." : "保存"}
      </Button>

      {state.status !== "idle" && (
        <p
          className={`text-sm whitespace-pre-wrap ${
            state.status === "success" ? "text-green-700" : "text-destructive"
          }`}
        >
          {state.message}
        </p>
      )}
    </form>
  )
}
