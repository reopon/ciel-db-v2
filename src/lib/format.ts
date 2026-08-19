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
