import Link from "next/link"
import { Sparkles } from "lucide-react"

// Entry point into /recap/[year]/[month] — placed above the calendar on
// the top page and on each month's /calendar/[year]/[month] page. Styled
// to stand out from the plain calendar/event links around it (a small
// nod to the recap page's own dark gradient) so it reads as "something
// special", not just another nav link.
export function RecapHighlightLink({ year, month }: { year: number; month: number }) {
  return (
    <Link
      href={`/recap/${year}/${month}`}
      className="flex items-center justify-between gap-2 rounded-xl bg-gradient-to-br from-[#111a33] to-[#1d2b55] px-4 py-3 text-sm font-semibold text-white transition-opacity hover:opacity-90"
    >
      <span className="flex items-center gap-2">
        <Sparkles className="size-4" />
        {month}月のハイライト
      </span>
      <span>→</span>
    </Link>
  )
}
