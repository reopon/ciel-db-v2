import Link from "next/link"
import { fetchVenuesWithEventCounts } from "@/lib/events"

export const dynamic = "force-dynamic"

export default async function VenuesPage() {
  const venues = await fetchVenuesWithEventCounts()

  return (
    <main className="max-w-3xl mx-auto px-4 py-8 space-y-6">
      <h1 className="text-2xl font-display tracking-wide font-semibold">会場一覧</h1>

      <div className="overflow-x-auto rounded-md border">
        <table className="w-full text-sm">
          <thead className="bg-muted">
            <tr>
              <th className="p-2 text-left font-medium sticky left-0 bg-muted min-w-48">会場名</th>
              <th className="p-2 text-left font-medium min-w-20">公演数</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {venues.map((venue) => (
              <tr key={venue.id} className="hover:bg-accent/50">
                <td className="p-2 sticky left-0 bg-background">
                  <Link
                    href={`/venues/${venue.slug}`}
                    className="font-medium text-brand underline underline-offset-2 decoration-brand/40 hover:decoration-brand"
                  >
                    {venue.name}
                  </Link>
                </td>
                <td className="p-2 text-muted-foreground">{venue.eventCount}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </main>
  )
}
