"use server"

import { revalidatePath } from "next/cache"
import { getSupabaseClient } from "@/lib/supabase"
import { findOrCreateVenueId } from "@/lib/events"
import type { ActionState } from "@/lib/action-state"
import type { SetlistRowPayload } from "@/lib/types"

export async function updateEventAction(_prevState: ActionState, formData: FormData): Promise<ActionState> {
  const eventId = Number(formData.get("eventId"))
  const eventName = String(formData.get("eventName") ?? "").trim()
  const venueIdField = String(formData.get("venueId") ?? "").trim()
  const newVenueName = String(formData.get("newVenueName") ?? "").trim()
  const isoDate = String(formData.get("date") ?? "").trim()
  const notes = String(formData.get("notes") ?? "").trim() || null
  const stageCostume = String(formData.get("stageCostume") ?? "").trim() || null

  if (!eventId || !eventName || !isoDate) {
    return { status: "error", message: "イベントID・イベント名・日付は必須です" }
  }

  let rows: SetlistRowPayload[]
  let urls: string[]
  try {
    rows = JSON.parse(String(formData.get("setlistJson") ?? "[]"))
    urls = JSON.parse(String(formData.get("linksJson") ?? "[]"))
  } catch (err) {
    console.error(err)
    return { status: "error", message: "セットリスト/関連URLの送信データが壊れています" }
  }

  const badRowIndex = rows.findIndex((r) => !Number.isInteger(r.songId) || r.songId <= 0)
  if (badRowIndex !== -1) {
    return { status: "error", message: `セットリストの${badRowIndex + 1}行目で曲が選択されていません` }
  }

  const supabase = getSupabaseClient()

  // A newly-typed venue name wins over the dropdown selection; otherwise
  // use whatever the dropdown carried (the blank "選択してください" option
  // resolves to null, intentionally clearing the venue).
  const venueId = newVenueName
    ? await findOrCreateVenueId(supabase, newVenueName)
    : venueIdField
      ? Number(venueIdField)
      : null

  const { error: eventError } = await supabase
    .from("events")
    .update({
      event_name: eventName,
      venue_id: venueId,
      date: isoDate,
      notes,
      stage_costume: stageCostume,
      updated_at: new Date().toISOString(),
    })
    .eq("id", eventId)

  if (eventError) {
    console.error(eventError)
    return { status: "error", message: "イベント基本情報の更新に失敗しました" }
  }

  // Delete-and-reinsert for both child tables rather than diffing rows.
  // The per-row UI is a UX requirement, not a mandate to reconcile DB
  // rows incrementally — this is a low-volume, single-admin tool, so
  // the simple approach is fine. No transaction wraps this (the rest of
  // the codebase has no .rpc()/transaction usage either), so a failure
  // partway through can leave a partially-written setlist; same residual
  // risk class insertEventWithSetlist already accepts today.
  const { error: delSetlistError } = await supabase.from("setlists").delete().eq("event_id", eventId)
  if (delSetlistError) {
    console.error(delSetlistError)
    return { status: "error", message: "セットリストの更新(削除)に失敗しました" }
  }

  if (rows.length > 0) {
    const inserts = rows.map((r, i) => ({
      event_id: eventId,
      song_id: r.songId,
      order: i + 1,
      note_before: r.noteBefore || null,
      note_after: r.noteAfter || null,
    }))
    const { error: insSetlistError } = await supabase.from("setlists").insert(inserts)
    if (insSetlistError) {
      console.error(insSetlistError)
      return { status: "error", message: "セットリストの更新(登録)に失敗しました" }
    }
  }

  const { error: delLinksError } = await supabase.from("event_links").delete().eq("event_id", eventId)
  if (delLinksError) {
    console.error(delLinksError)
    return { status: "error", message: "関連URLの更新(削除)に失敗しました" }
  }

  const cleanUrls = urls.map((u) => u.trim()).filter(Boolean)
  if (cleanUrls.length > 0) {
    const { error: insLinksError } = await supabase
      .from("event_links")
      .insert(cleanUrls.map((url, i) => ({ event_id: eventId, url, order: i })))
    if (insLinksError) {
      console.error(insLinksError)
      return { status: "error", message: "関連URLの更新(登録)に失敗しました" }
    }
  }

  revalidatePath("/")
  revalidatePath("/calendar")

  return { status: "success", message: "更新しました！" }
}
