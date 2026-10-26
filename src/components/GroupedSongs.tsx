import { getSupabaseClient } from "@/lib/supabase"
import { fetchSongIdsWithLinks } from "@/lib/songs"
import { GroupedSongsView, type GroupField } from "@/components/GroupedSongsView"
import type { Song } from "@/lib/types"

async function fetchGrouped(field: GroupField): Promise<[string, (Song & { hasLinks: boolean })[]][]> {
  const supabase = getSupabaseClient()
  const [{ data, error }, linkedIds] = await Promise.all([
    supabase
      .from("songs")
      .select("*")
      .eq("is_repertoire", true)
      .order(field, { ascending: true })
      .order("release_date", { ascending: true }),
    fetchSongIdsWithLinks(),
  ])

  if (error) {
    console.error(error)
    return []
  }

  const groups = new Map<string, (Song & { hasLinks: boolean })[]>()
  for (const song of data as Song[]) {
    const key = song[field] || "不明"
    if (!groups.has(key)) groups.set(key, [])
    groups.get(key)!.push({ ...song, hasLinks: linkedIds.has(song.id) })
  }
  return Array.from(groups.entries()).sort(
    (a, b) => b[1].length - a[1].length || a[0].localeCompare(b[0], "ja")
  )
}

export async function GroupedSongs({ field }: { field: GroupField }) {
  const groups = await fetchGrouped(field)
  return <GroupedSongsView groups={groups} />
}
