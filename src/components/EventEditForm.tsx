"use client"

import { useState } from "react"
import { useActionState } from "react"
import { Button } from "@/components/ui/button"
import { updateEventAction } from "@/actions/event-edit"
import { initialActionState } from "@/lib/action-state"
import type { EventWithSetlist, Song, SetlistRowPayload, Venue } from "@/lib/types"

interface RowState {
  key: string
  songId: number | null
  noteBefore: string
  noteAfter: string
}

interface LinkState {
  key: string
  url: string
}

const inputClass =
  "w-full p-2 rounded-md border bg-background text-sm outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50"

function newKey(): string {
  return typeof crypto !== "undefined" && "randomUUID" in crypto
    ? crypto.randomUUID()
    : Math.random().toString(36).slice(2)
}

function moveItem<T>(items: T[], index: number, dir: -1 | 1): T[] {
  const target = index + dir
  if (target < 0 || target >= items.length) return items
  const next = items.slice()
  ;[next[index], next[target]] = [next[target], next[index]]
  return next
}

export function EventEditForm({
  event,
  songs,
  venues,
}: {
  event: EventWithSetlist
  songs: Pick<Song, "id" | "slug" | "title">[]
  venues: Pick<Venue, "id" | "name">[]
}) {
  const [state, formAction, pending] = useActionState(updateEventAction, initialActionState)

  const [rows, setRows] = useState<RowState[]>(() =>
    event.setlist.map((entry) => ({
      key: newKey(),
      songId: entry.song.id,
      noteBefore: entry.note_before ?? "",
      noteAfter: entry.note_after ?? "",
    }))
  )
  const [links, setLinks] = useState<LinkState[]>(() =>
    event.linkUrls.map((url) => ({ key: newKey(), url }))
  )

  const addRow = () => setRows((rs) => [...rs, { key: newKey(), songId: null, noteBefore: "", noteAfter: "" }])
  const removeRow = (key: string) => setRows((rs) => rs.filter((r) => r.key !== key))
  const moveRow = (key: string, dir: -1 | 1) =>
    setRows((rs) => moveItem(rs, rs.findIndex((r) => r.key === key), dir))
  const updateRow = (key: string, patch: Partial<RowState>) =>
    setRows((rs) => rs.map((r) => (r.key === key ? { ...r, ...patch } : r)))

  const addLink = () => setLinks((ls) => [...ls, { key: newKey(), url: "" }])
  const removeLink = (key: string) => setLinks((ls) => ls.filter((l) => l.key !== key))
  const moveLink = (key: string, dir: -1 | 1) =>
    setLinks((ls) => moveItem(ls, ls.findIndex((l) => l.key === key), dir))
  const updateLink = (key: string, url: string) =>
    setLinks((ls) => ls.map((l) => (l.key === key ? { ...l, url } : l)))

  const setlistJson = JSON.stringify(
    rows
      .filter((r) => r.songId != null)
      .map(
        (r): SetlistRowPayload => ({
          songId: r.songId!,
          noteBefore: r.noteBefore || null,
          noteAfter: r.noteAfter || null,
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
          <select name="venueId" defaultValue={event.venue?.id ?? ""} className={inputClass}>
            <option value="">選択してください</option>
            {venues.map((venue) => (
              <option key={venue.id} value={venue.id}>
                {venue.name}
              </option>
            ))}
          </select>
          <input
            name="newVenueName"
            type="text"
            placeholder="新しい会場を追加(入力すると上の選択より優先されます)"
            className={`${inputClass} mt-1.5`}
          />
        </Field>
        <Field label="日付">
          <input name="date" type="date" required defaultValue={event.date} className={inputClass} />
        </Field>
        <Field label="備考">
          <textarea name="notes" rows={2} defaultValue={event.notes ?? ""} className={inputClass} />
        </Field>
        <Field label="衣装">
          <input
            name="stageCostume"
            type="text"
            defaultValue={event.stage_costume ?? ""}
            className={inputClass}
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
                <select
                  value={row.songId ?? ""}
                  onChange={(e) => updateRow(row.key, { songId: e.target.value ? Number(e.target.value) : null })}
                  className={inputClass}
                >
                  <option value="">選択してください</option>
                  {songs.map((song) => (
                    <option key={song.id} value={song.id}>
                      {song.title}
                    </option>
                  ))}
                </select>
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

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1">
      <label className="block text-sm font-medium">{label}</label>
      {children}
    </div>
  )
}
