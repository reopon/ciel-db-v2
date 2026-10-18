import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { SetlistView } from "@/components/SetlistView"
import { EventLinks } from "@/components/EventLinks"
import { formatDate } from "@/lib/format"
import type { EventWithSetlist } from "@/lib/types"

export function EventCard({ event }: { event: EventWithSetlist }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">{event.event_name}</CardTitle>
        <CardDescription>
          {formatDate(event.date)} @ {event.venue?.name || "場所不明"}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <SetlistView setlist={event.setlist} />
        <EventLinks urls={event.linkUrls} />
      </CardContent>
    </Card>
  )
}
