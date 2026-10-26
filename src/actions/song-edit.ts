"use server"

import { revalidatePath } from "next/cache"
import { getSupabaseClient } from "@/lib/supabase"
import type { ActionState } from "@/lib/action-state"

// Same delete-and-reinsert approach as updateEventAction for event_links —
// low-volume, single-admin tool, so the simple approach is fine over
// diffing rows.
export async function updateSongAction(_prevState: ActionState, formData: FormData): Promise<ActionState> {
  const songId = Number(formData.get("songId"))
  const title = String(formData.get("title") ?? "").trim()
  const releaseDate = String(formData.get("releaseDate") ?? "").trim()
  const lyricist = String(formData.get("lyricist") ?? "").trim() || null
  const composer = String(formData.get("composer") ?? "").trim() || null
  const arranger = String(formData.get("arranger") ?? "").trim() || null
  const choreographer = String(formData.get("choreographer") ?? "").trim() || null
  const notes = String(formData.get("notes") ?? "").trim() || null

  if (!songId || !title || !releaseDate) {
    return { status: "error", message: "曲ID・曲名・発売日は必須です" }
  }

  let urls: string[]
  try {
    urls = JSON.parse(String(formData.get("linksJson") ?? "[]"))
  } catch (err) {
    console.error(err)
    return { status: "error", message: "関連URLの送信データが壊れています" }
  }

  const supabase = getSupabaseClient()

  const { error: songError } = await supabase
    .from("songs")
    .update({
      title,
      release_date: releaseDate,
      lyricist,
      composer,
      arranger,
      choreographer,
      notes,
    })
    .eq("id", songId)

  if (songError) {
    console.error(songError)
    return { status: "error", message: "曲情報の更新に失敗しました" }
  }

  const { error: delLinksError } = await supabase.from("song_links").delete().eq("song_id", songId)
  if (delLinksError) {
    console.error(delLinksError)
    return { status: "error", message: "関連URLの更新(削除)に失敗しました" }
  }

  const cleanUrls = urls.map((u) => u.trim()).filter(Boolean)
  if (cleanUrls.length > 0) {
    const { error: insLinksError } = await supabase
      .from("song_links")
      .insert(cleanUrls.map((url, i) => ({ song_id: songId, url, order: i })))
    if (insLinksError) {
      console.error(insLinksError)
      return { status: "error", message: "関連URLの更新(登録)に失敗しました" }
    }
  }

  // Song titles/credits are embedded into event setlists too (EVENT_SELECT's
  // songs(...) join), so revalidate those surfaces alongside /music itself.
  revalidatePath("/")
  revalidatePath("/events")
  revalidatePath("/calendar")
  revalidatePath("/music", "layout")

  return { status: "success", message: "更新しました！" }
}
