"use client"

import { useState } from "react"
import { useActionState } from "react"
import { Button } from "@/components/ui/button"
import { Field } from "@/components/FormField"
import { updateSongAction } from "@/actions/song-edit"
import { initialActionState } from "@/lib/action-state"
import { inputClass, newKey, moveItem } from "@/lib/form-utils"
import type { Song } from "@/lib/types"

interface LinkState {
  key: string
  url: string
}

export function SongEditForm({ song, links }: { song: Song; links: string[] }) {
  const [state, formAction, pending] = useActionState(updateSongAction, initialActionState)

  const [linkItems, setLinkItems] = useState<LinkState[]>(() => links.map((url) => ({ key: newKey(), url })))

  const addLink = () => setLinkItems((ls) => [...ls, { key: newKey(), url: "" }])
  const removeLink = (key: string) => setLinkItems((ls) => ls.filter((l) => l.key !== key))
  const moveLink = (key: string, dir: -1 | 1) =>
    setLinkItems((ls) => moveItem(ls, ls.findIndex((l) => l.key === key), dir))
  const updateLink = (key: string, url: string) =>
    setLinkItems((ls) => ls.map((l) => (l.key === key ? { ...l, url } : l)))

  const linksJson = JSON.stringify(linkItems.map((l) => l.url).filter(Boolean))

  return (
    <form action={formAction} className="space-y-8">
      <input type="hidden" name="songId" value={song.id} readOnly />
      <input type="hidden" name="linksJson" value={linksJson} readOnly />

      <section className="space-y-4">
        <Field label="曲名">
          <input name="title" type="text" required defaultValue={song.title} className={inputClass} />
        </Field>
        <Field label="発売日">
          <input name="releaseDate" type="date" required defaultValue={song.release_date} className={inputClass} />
        </Field>
        <Field label="作詞">
          <input name="lyricist" type="text" defaultValue={song.lyricist ?? ""} className={inputClass} />
        </Field>
        <Field label="作曲">
          <input name="composer" type="text" defaultValue={song.composer ?? ""} className={inputClass} />
        </Field>
        <Field label="編曲">
          <input name="arranger" type="text" defaultValue={song.arranger ?? ""} className={inputClass} />
        </Field>
        <Field label="振付">
          <input name="choreographer" type="text" defaultValue={song.choreographer ?? ""} className={inputClass} />
        </Field>
        <Field label="備考">
          <textarea name="notes" rows={2} defaultValue={song.notes ?? ""} className={inputClass} />
        </Field>
      </section>

      <section className="space-y-3">
        <h2 className="text-sm font-semibold">関連URL</h2>
        <div className="space-y-2">
          {linkItems.map((link, i) => (
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
                  disabled={i === linkItems.length - 1}
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
