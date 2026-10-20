import Link from "next/link"

export function MonthLinksSection({
  label,
  months,
}: {
  label: string
  months: { year: string; month: string }[]
}) {
  if (months.length === 0) return null

  return (
    <section className="pt-6 border-t">
      <h2 className="text-sm font-semibold text-muted-foreground mb-3">{label}</h2>
      <div className="flex flex-wrap gap-2">
        {months.map(({ year, month }) => (
          <Link
            key={`${year}-${month}`}
            href={`/calendar/${year}/${Number(month)}`}
            className="px-3 py-1.5 rounded-md border text-sm hover:bg-accent/50"
          >
            {year}年{Number(month)}月
          </Link>
        ))}
      </div>
    </section>
  )
}
