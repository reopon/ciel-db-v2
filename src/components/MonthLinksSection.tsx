import Link from "next/link"

export function MonthLinksSection({
  label,
  months,
}: {
  label: string
  months: { year: string; month: string }[]
}) {
  if (months.length === 0) return null

  // One row per year (years top-to-bottom, ascending) with that year's
  // months as compact pills in a horizontal strip — a flat one-per-row
  // list of "20XX年X月" buttons was too sparse, but a plain 3-column grid
  // made it hard to scan chronologically (see: user feedback on the old
  // flex-wrap grid).
  const byYear: { year: string; months: string[] }[] = []
  for (const { year, month } of months) {
    const current = byYear[byYear.length - 1]
    if (current && current.year === year) current.months.push(month)
    else byYear.push({ year, months: [month] })
  }

  return (
    <section className="pt-6 border-t">
      <h2 className="text-sm font-semibold text-muted-foreground mb-3">{label}</h2>
      <div className="space-y-2">
        {byYear.map(({ year, months: monthsInYear }) => (
          <div key={year} className="flex items-baseline gap-2">
            <span className="text-sm font-medium text-muted-foreground w-16 shrink-0">{year}年</span>
            <div className="flex flex-wrap gap-1.5">
              {monthsInYear.map((month) => (
                <Link
                  key={`${year}-${month}`}
                  href={`/calendar/${year}/${Number(month)}`}
                  className="px-2.5 py-1 rounded-md border text-sm hover:bg-accent/50"
                >
                  {Number(month)}月
                </Link>
              ))}
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}
