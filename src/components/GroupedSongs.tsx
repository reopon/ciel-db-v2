import Link from "next/link"
import { getSupabaseClient } from "@/lib/supabase"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import type { Song } from "@/lib/types"

type GroupField = "composer" | "lyricist"

const FIELD_LABEL: Record<GroupField, string> = {
  composer: "作曲",
  lyricist: "作詞",
}

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
  return Array.from(groups.entries())
}

export async function GroupedSongs({ field, pageTitle }: { field: GroupField; pageTitle: string }) {
  const groups = await fetchGrouped(field)
  const otherField: GroupField = field === "composer" ? "lyricist" : "composer"

  return (
    <main className="max-w-3xl mx-auto px-4 py-8 space-y-6">
      <h1 className="text-2xl font-bold">{pageTitle}</h1>

      <div className="space-y-6">
        {groups.map(([name, songs]) => (
          <Card key={name}>
            <CardHeader>
              <CardTitle className="text-base">
                {name} ({songs.length}曲)
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {songs.map((song) => (
                  <Link
                    key={song.id}
                    href={`/music/${song.id}`}
                    className="p-2 rounded-md border hover:bg-accent/50 block"
                  >
                    <div className="font-medium text-sm">{song.title}</div>
                    <div className="text-xs text-muted-foreground">
                      {FIELD_LABEL[otherField]}: {song[otherField] || "-"}
                    </div>
                  </Link>
                ))}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </main>
  )
}
