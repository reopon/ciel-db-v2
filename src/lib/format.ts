export function formatDate(isoDate: string): string {
  const date = new Date(`${isoDate}T00:00:00`)
  return date.toLocaleDateString("ja-JP", {
    year: "numeric",
    month: "long",
    day: "numeric",
    weekday: "short",
  })
}

export function yearMonthLabel(isoDate: string): string {
  const [year, month] = isoDate.split("-")
  return `${year}年${Number(month)}月`
}

// "2026-10" -> "2026年10月"
export function monthKeyToLabel(key: string): string {
  const [year, month] = key.split("-")
  return `${year}年${Number(month)}月`
}

// Today's date in JST as YYYY-MM-DD, independent of the server's own
// timezone (Vercel functions run in UTC, which would read a day off
// around JST midnight otherwise).
export function todayJstIso(): string {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Tokyo",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(new Date())
  const map = Object.fromEntries(parts.map((p) => [p.type, p.value]))
  return `${map.year}-${map.month}-${map.day}`
}
