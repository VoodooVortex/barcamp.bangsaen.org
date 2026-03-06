import { db } from "@/lib/db";
import { eventYears, venues } from "@/lib/db/schema";
import { eq, asc } from "drizzle-orm";
import { requireAuthenticated } from "@/lib/auth/admin";
import { notFound, redirect } from "next/navigation";
import VenuesClient from "./venues-client";

interface VenuesPageProps {
    params: Promise<{ slug: string }>;
}

export default async function VenuesPage({ params }: VenuesPageProps) {
    try {
        await requireAuthenticated();
    } catch {
        redirect("/auth/login");
    }

    const { slug } = await params;

    if (!slug) {
        notFound();
    }

    const eventYear = await db.query.eventYears.findFirst({
        where: eq(eventYears.slug, slug),
    });

    if (!eventYear) {
        notFound();
    }

    const venuesList = await db.query.venues.findMany({
        where: eq(venues.eventYearId, eventYear.id),
        orderBy: asc(venues.name),
    });

    // Convert Date objects to ISO strings for client interaction
    const serializedVenues = venuesList.map(venue => ({
        ...venue,
        createdAt: venue.createdAt.toISOString(),
        updatedAt: venue.updatedAt.toISOString(),
    }));

    return <VenuesClient initialVenues={serializedVenues} slug={slug} />;
}
