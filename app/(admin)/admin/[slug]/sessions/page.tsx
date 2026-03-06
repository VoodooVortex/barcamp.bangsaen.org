import { db } from "@/lib/db";
import { eventYears, sessions } from "@/lib/db/schema";
import { eq, asc } from "drizzle-orm";
import { requireAuthenticated } from "@/lib/auth/admin";
import { notFound, redirect } from "next/navigation";
import SessionsClient from "./sessions-client";

interface SessionsPageProps {
    params: Promise<{ slug: string }>;
}

export default async function SessionsPage({ params }: SessionsPageProps) {
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

    const sessionsList = await db.query.sessions.findMany({
        where: eq(sessions.eventYearId, eventYear.id),
        with: {
            venue: true,
        },
        orderBy: asc(sessions.startAt),
    });

    // Convert Date objects to ISO strings for client component serialization
    const serializedSessions = sessionsList.map(session => ({
        ...session,
        startAt: session.startAt.toISOString(),
        endAt: session.endAt.toISOString(),
        actualStartAt: session.actualStartAt?.toISOString() || null,
        actualEndAt: session.actualEndAt?.toISOString() || null,
        createdAt: session.createdAt.toISOString(),
        updatedAt: session.updatedAt.toISOString(),
    }));

    return <SessionsClient initialSessions={serializedSessions} slug={slug} />;
}
