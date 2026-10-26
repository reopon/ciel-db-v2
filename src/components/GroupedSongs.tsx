import { getSupabaseClient } from "@/lib/supabase"
import { GroupedSongsView, type GroupField } from "@/components/GroupedSongsView"
import type { Song } from "@/lib/types"

async function fetchGrouped(field: GroupField): Promise<[string, Song[]][]> {
  const supabase = getSupabaseClient()
  const { data, error } = await supabase
    .from("songs")
    .select("*")
    .eq("is_repertoire", true)
    .order(field, { ascending: true })
    .order("release_date", { ascending: true })

  if (error) {
    console.error(error)
    return []
  }

  const groups = new Map<string, Song[]>()
  for (const song of data as Song[]) {
    const key = song[field] || "不明"
    if (!groups.has(key)) groups.set(key, [])
    groups.get(key)!.push(song)
  }
  return Array.from(groups.entries()).sort(
    (a, b) => b[1].length - a[1].length || a[0].localeCompare(b[0], "ja")
  )
}

export async function GroupedSongs({ field }: { field: GroupField }) {
  const groups = await fetchGrouped(field)
  return <GroupedSongsView field={field} groups={groups} />
}
