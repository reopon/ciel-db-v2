"use server"

import { revalidatePath } from "next/cache"
import { getSupabaseClient } from "@/lib/supabase"
import { buildSetlistEntries, parseImportText, parseSetlistLines } from "@/lib/setlist-parser"
import type { ActionState } from "@/lib/action-state"

async function insertEventWithSetlist(params: {
  eventName: string
  location: string
  isoDate: string
  notes: string | null
  lines: string[]
}): Promise<ActionState> {
  const { eventName, location, isoDate, notes, lines } = params
  const supabase = getSupabaseClient()

  const { data: existing, error: dupError } = await supabase
    .from("events")
    .select("id")
    .eq("event_name", eventName)
    .eq("date", isoDate)

  if (dupError) {
    console.error(dupError)
    return { status: "error", message: "重複チェックに失敗しました" }
  }

  let eventId: number
  let reusedExistingEvent = false

  if (existing && existing.length > 0) {
    eventId = existing[0].id
    reusedExistingEvent = true

    // Already registered — only allowed to proceed if that event doesn't
    // have a setlist yet (e.g. the event insert succeeded but the setlist
    // insert failed previously). Otherwise this would just duplicate rows.
    const { count, error: countError } = await supabase
      .from("setlists")
      .select("id", { count: "exact", head: true })
      .eq("event_id", eventId)

    if (countError) {
      console.error(countError)
      return { status: "error", message: "既存イベントのセットリスト確認に失敗しました" }
    }
    if (count && count > 0) {
      return {
        status: "error",
        message: "同じ日付・イベント名がすでに登録されていて、セットリストも登録済みです",
      }
    }
  } else {
    const { data: eventRow, error: eventError } = await supabase
      .from("events")
      .insert([{ event_name: eventName, location, date: isoDate, notes }])
      .select()
      .single()

    if (eventError || !eventRow) {
      console.error(eventError)
      return { status: "error", message: "イベント登録に失敗しました" }
    }
    eventId = eventRow.id
  }

  if (lines.length === 0) {
    revalidatePath("/")
    return { status: "success", message: "イベントを登録しました(セットリストなし)" }
  }

  const { data: songs, error: songsError } = await supabase
    .from("songs")
    .select("id, title")
    .in("title", lines)

  if (songsError) {
    console.error(songsError)
    return { status: "error", message: "イベントは登録済みですが、曲情報の取得に失敗しました" }
  }

  const songIdByTitle = new Map(songs.map((s) => [s.title, s.id as number]))
  const { entries, unmatchedTitles } = buildSetlistEntries(lines, songIdByTitle)

  if (entries.length === 0) {
    revalidatePath("/")
    return {
      status: "success",
      message: `イベントを登録しましたが、曲を1件も認識できませんでした(曲名が完全一致していない可能性があります): ${lines.join(", ")}`,
    }
  }

  const inserts = entries.map((entry, index) => ({
    event_id: eventId,
    song_id: entry.songId,
    order: index + 1,
    note_before: entry.noteBefore,
    note_after: entry.noteAfter,
  }))

  const { error: setlistError } = await supabase.from("setlists").insert(inserts)
  if (setlistError) {
    console.error(setlistError)
    return { status: "error", message: "イベントは登録済みですが、セットリストの登録に失敗しました" }
  }

  revalidatePath("/")

  const noteSuffix =
    unmatchedTitles.length > 0
      ? ` (次の行は曲として認識できずMC/ノート扱いにしました: ${unmatchedTitles.join(", ")})`
      : ""
  const baseMessage = reusedExistingEvent
    ? "既存イベントにセットリストを登録しました！🎉"
    : "登録完了しました！🎉"

  return { status: "success", message: `${baseMessage}${noteSuffix}` }
}

export async function registerEventAction(
  _prevState: ActionState,
  formData: FormData
): Promise<ActionState> {
  const eventName = String(formData.get("eventName") ?? "").trim()
  const location = String(formData.get("location") ?? "").trim()
  const isoDate = String(formData.get("date") ?? "").trim()
  const notes = String(formData.get("notes") ?? "").trim()
  const setlistText = String(formData.get("setlistText") ?? "")

  if (!eventName || !location || !isoDate) {
    return { status: "error", message: "イベント名・会場・日付は必須です" }
  }

  return insertEventWithSetlist({
    eventName,
    location,
    isoDate,
    notes: notes || null,
    lines: parseSetlistLines(setlistText),
  })
}

export async function importSetlistAction(
  _prevState: ActionState,
  formData: FormData
): Promise<ActionState> {
  const rawText = String(formData.get("rawText") ?? "")
  const parsed = parseImportText(rawText)

  if (!parsed.isoDate) {
    return { status: "error", message: "日付の解析に失敗しました(例: 2025.6.8(日) の形式で先頭行に入れてください)" }
  }

  return insertEventWithSetlist({
    eventName: parsed.eventName,
    location: parsed.location,
    isoDate: parsed.isoDate,
    notes: null,
    lines: parsed.lines,
  })
}
