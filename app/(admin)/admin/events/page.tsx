import { db } from "@/lib/db";
import { eventYears } from "@/lib/db/schema";
import { desc } from "drizzle-orm";
import { requireAuthenticated } from "@/lib/auth/admin";
import { redirect } from "next/navigation";
import EventsClient from "./events-client";

export default async function EventsPage() {
    try {
        await requireAuthenticated();
    } catch {
        redirect("/auth/login?redirect=/admin/events");
    }

    const eventsList = await db.query.eventYears.findMany({
        orderBy: desc(eventYears.slug),
        with: {
            venues: { columns: { id: true } },
            sessions: { columns: { id: true } }
        }
    });

    const enhancedEvents = eventsList.map((event) => ({
        ...event,
        year: event.year || null,
        location: event.location || null,
        startDate: event.startDate ? event.startDate.toISOString() : null,
        endDate: event.endDate ? event.endDate.toISOString() : null,
        venueCount: event.venues.length,
        sessionCount: event.sessions.length,
        venues: undefined,
        sessions: undefined,
        createdAt: event.createdAt.toISOString(),
        updatedAt: event.updatedAt.toISOString(),
    }));

    return <EventsClient initialEvents={enhancedEvents} />;
}
