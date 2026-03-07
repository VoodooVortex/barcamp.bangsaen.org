// Live viewer page for a specific year
// Displays real-time session schedule with On Air and Up Next sections
import { Suspense } from "react";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { LiveViewer } from "@/components/live/live-viewer";
import { db } from "@/lib/db";
import { eventYears, venues, sessions } from "@/lib/db/schema";
import { getCurrentServerTime } from "@/lib/time/ntp";
import { eq, and, asc, lte, gt } from "drizzle-orm";

export const dynamic = "force-dynamic";

interface LivePageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({
  params,
}: LivePageProps): Promise<Metadata> {
  const { slug } = await params;

  const eventYear = await db.query.eventYears.findFirst({
    where: eq(eventYears.slug, slug),
  });

  if (!eventYear || !eventYear.published) {
    return {
      title: "Event Not Found",
    };
  }

  return {
    title: `Live Sessions: ${eventYear.name}`,
    description: `Track real-time sessions and schedules for ${eventYear.name} at Barcamp Bangsaen.`,
    openGraph: {
      title: `Live Sessions: ${eventYear.name} | Barcamp Bangsaen`,
      description: `Track real-time sessions and schedules for ${eventYear.name}. Join the unconference!`,
      type: "website",
      // Ideally, an event-specific image could go here:
      images: [{ url: `/og-${slug}.png`, width: 1200, height: 630 }],
    },
    twitter: {
      card: "summary_large_image",
      title: `Live Sessions: ${eventYear.name} | Barcamp Bangsaen`,
      description: `Track real-time sessions and schedules for ${eventYear.name}.`,
      images: [{ url: `/og-${slug}.png`, width: 1200, height: 630 }],
    },
  };
}

async function getSchedule(slug: string) {
  try {
    const eventYear = await db.query.eventYears.findFirst({
      where: eq(eventYears.slug, slug),
    });

    if (!eventYear || !eventYear.published) {
      return null;
    }

    const venuesList = await db.query.venues.findMany({
      where: and(
        eq(venues.eventYearId, eventYear.id),
        eq(venues.isActive, true),
      ),
      orderBy: asc(venues.order),
    });

    const sessionsList = await db.query.sessions.findMany({
      where: and(
        eq(sessions.eventYearId, eventYear.id),
        eq(sessions.isPublished, true),
      ),
      with: {
        venue: true,
      },
      orderBy: asc(sessions.startAt),
    });

    return {
      eventYear: {
        id: eventYear.id,
        slug: eventYear.slug,
        name: eventYear.name,
        location: eventYear.location ?? null,
        timezone: eventYear.timezone,
        startDate: eventYear.startDate?.toISOString() ?? null,
        endDate: eventYear.endDate?.toISOString() ?? null,
      },
      venues: venuesList.map((v) => ({
        id: v.id,
        name: v.name,
        order: v.order,
      })),
      sessions: sessionsList.map((session) => ({
        id: session.id,
        title: session.title,
        description: session.description,
        speakerName: session.speakerName,
        startAt: session.startAt.toISOString(),
        endAt: session.endAt.toISOString(),
        actualStartAt: session.actualStartAt?.toISOString() ?? null,
        actualEndAt: session.actualEndAt?.toISOString() ?? null,
        tags: session.tags,
        venueId: session.venueId,
        venue: session.venue
          ? {
              id: session.venue.id,
              name: session.venue.name,
              order: session.venue.order,
            }
          : { id: "", name: "", order: 0 },
      })),
    };
  } catch (error) {
    console.error("Failed to fetch schedule:", error);
    return null;
  }
}

async function getStatus(slug: string) {
  try {
    const eventYear = await db.query.eventYears.findFirst({
      where: eq(eventYears.slug, slug),
    });

    if (!eventYear || !eventYear.published) {
      return null;
    }

    const now = getCurrentServerTime();

    const venuesList = await db.query.venues.findMany({
      where: and(
        eq(venues.eventYearId, eventYear.id),
        eq(venues.isActive, true),
      ),
      orderBy: asc(venues.order),
    });

    // Use endAt > now instead of startAt >= startOfDay so that sessions
    // which started before local midnight but are still running are included.
    const endOfDay = new Date(now);
    endOfDay.setHours(23, 59, 59, 999);

    const allSessions = await db.query.sessions.findMany({
      where: and(
        eq(sessions.eventYearId, eventYear.id),
        eq(sessions.isPublished, true),
        gt(sessions.endAt, now),
        lte(sessions.startAt, endOfDay),
      ),
      with: {
        venue: true,
      },
      orderBy: asc(sessions.startAt),
    });

    const onAir = allSessions.filter((session) => {
      if (session.actualEndAt) return false; // Manually ended
      if (session.actualStartAt) return true; // Manually started, not ended
      return new Date(session.startAt) <= now && new Date(session.endAt) > now;
    });

    const upNext = allSessions.filter(
      (s) => !s.actualStartAt && !s.actualEndAt && new Date(s.startAt) > now,
    );

    return {
      serverTime: now.toISOString(),
      timezone: eventYear.timezone,
      onAir: onAir.map((session) => ({
        id: session.id,
        title: session.title,
        speakerName: session.speakerName,
        startAt: session.startAt.toISOString(),
        endAt: session.endAt.toISOString(),
        actualStartAt: session.actualStartAt?.toISOString() ?? null,
        actualEndAt: session.actualEndAt?.toISOString() ?? null,
        tags: session.tags,
        livestreamUrl: session.livestreamUrl ?? undefined,
        venue: session.venue
          ? {
              id: session.venue.id,
              name: session.venue.name,
              order: session.venue.order,
            }
          : { id: "", name: "", order: 0 },
        progress: calculateProgress(
          session.actualStartAt || session.startAt,
          session.endAt,
          now,
        ),
      })),
      upNext: upNext.map((session) => ({
        id: session.id,
        title: session.title,
        speakerName: session.speakerName,
        startAt: session.startAt.toISOString(),
        endAt: session.endAt.toISOString(),
        tags: session.tags,
        venue: session.venue
          ? {
              id: session.venue.id,
              name: session.venue.name,
              order: session.venue.order,
            }
          : { id: "", name: "", order: 0 },
        startsIn: calculateTimeUntil(session.startAt, now),
      })),
    };
  } catch (error) {
    console.error("Failed to fetch status:", error);
    return null;
  }
}

async function LivePageContent({ slug }: { slug: string }) {
  const [scheduleData, statusData] = await Promise.all([
    getSchedule(slug),
    getStatus(slug),
  ]);

  if (!scheduleData || !statusData) {
    notFound();
  }

  return (
    <LiveViewer
      slug={slug}
      initialData={scheduleData}
      initialStatus={statusData}
    />
  );
}

async function LivePageRouteContent({ params }: LivePageProps) {
  const { slug } = await params;

  if (!slug) {
    notFound();
  }

  return <LivePageContent slug={slug} />;
}

function calculateProgress(
  startAt: Date | string,
  endAt: Date | string,
  now: Date,
): number {
  const start = new Date(startAt).getTime();
  const end = new Date(endAt).getTime();
  const current = now.getTime();

  if (current <= start) return 0;
  if (current >= end) return 100;

  return Math.round(((current - start) / (end - start)) * 100);
}

function calculateTimeUntil(startAt: Date | string, now: Date): string {
  const start = new Date(startAt).getTime();
  const current = now.getTime();
  const diffMs = start - current;

  if (diffMs <= 0) return "Starting now";

  const diffMins = Math.ceil(diffMs / 60000);

  if (diffMins < 60) {
    return `in ${diffMins} min`;
  }

  const diffHours = Math.floor(diffMins / 60);
  const remainingMins = diffMins % 60;

  if (remainingMins === 0) {
    return `in ${diffHours} hr`;
  }

  return `in ${diffHours} hr ${remainingMins} min`;
}

function LivePageFallback() {
  return (
    <div className="rounded-lg border bg-card p-6">
      <p className="text-muted-foreground">Loading live Sessions...</p>
    </div>
  );
}

export default function LivePage({ params }: LivePageProps) {
  return (
    <div className="min-h-screen bg-[#FFFDF5] dark:bg-background">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-8 w-full max-w-[2560px]">
        <Suspense fallback={<LivePageFallback />}>
          <LivePageRouteContent params={params} />
        </Suspense>
      </div>
    </div>
  );
}
