import Link from "next/link"
import { Card, CardAction, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { InteractiveSetlist } from "@/components/InteractiveSetlist"
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
        <CardAction>
          <Link
            href={`/events/edit/${event.id}`}
            className="text-xs text-muted-foreground hover:underline"
          >
            編集
          </Link>
        </CardAction>
      </CardHeader>
      <CardContent>
        <InteractiveSetlist setlist={event.setlist} />
        <EventLinks urls={event.linkUrls} />
      </CardContent>
    </Card>
  )
}
