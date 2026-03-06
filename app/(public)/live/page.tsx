import { redirect, notFound } from "next/navigation";
import { db } from "@/lib/db";
import { eventYears } from "@/lib/db/schema";
import { desc, eq } from "drizzle-orm";

export const dynamic = "force-dynamic";

export default async function LiveIndexPage() {
    // First try to find the explicitly marked active year
    const activeEvent = await db.query.eventYears.findFirst({
        where: eq(eventYears.isCurrentYear, true),
    });

    if (activeEvent) {
        redirect(`/live/${activeEvent.slug}`);
    }

    // Fallback to the latest published year if no explicit active year is set
    const latestPublished = await db.query.eventYears.findFirst({
        where: eq(eventYears.published, true),
        orderBy: desc(eventYears.createdAt),
    });

    if (latestPublished) {
        redirect(`/live/${latestPublished.slug}`);
    }

    // If no events are published or available, show a 404
    notFound();
}
