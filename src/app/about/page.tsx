import { Fragment } from "react"
import { getSupabaseClient } from "@/lib/supabase"

export const dynamic = "force-dynamic"

interface AboutEntry {
  id: number
  title: string | null
  body: string
  is_visible: boolean
  order: number
}

async function fetchAboutEntries(): Promise<AboutEntry[]> {
  const supabase = getSupabaseClient()
  const { data, error } = await supabase
    .from("about_entries")
    .select("*")
    .eq("is_visible", true)

  if (error) {
    console.error(error)
    return []
  }
  return (data as AboutEntry[]).slice().sort((a, b) => a.order - b.order)
}

const URL_PATTERN = /https?:\/\/[^\s]+/g

// body の中の素のURLをそのままリンクテキストとしてリンク化する(記法なし)。
function linkify(line: string) {
  const parts = line.split(URL_PATTERN)
  const urls = line.match(URL_PATTERN) ?? []

  return parts.map((part, i) => (
    <Fragment key={i}>
      {part}
      {urls[i] && (
        <a
          href={urls[i]}
          target="_blank"
          rel="noopener noreferrer"
          className="text-brand underline underline-offset-2 decoration-brand/40 hover:decoration-brand"
        >
          {urls[i]}
        </a>
      )}
    </Fragment>
  ))
}

export default async function AboutPage() {
  const entries = await fetchAboutEntries()

  return (
    <main className="max-w-xl mx-auto px-4 py-10 text-sm leading-relaxed space-y-6">
      <h1 className="text-2xl font-display tracking-wide font-semibold">About</h1>

      {entries.map((entry) => (
        <section key={entry.id} className="space-y-2">
          {entry.title && <h2 className="font-semibold">{entry.title}</h2>}
          <p>
            {entry.body.split("\n").map((line, i) => (
              <Fragment key={i}>
                {i > 0 && <br />}
                {linkify(line)}
              </Fragment>
            ))}
          </p>
        </section>
      ))}
    </main>
  )
}
