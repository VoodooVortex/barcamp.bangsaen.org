import { db } from "@/lib/db";
import { eventYears, sessions, eventPhotos } from "@/lib/db/schema";
import { eq, asc } from "drizzle-orm";
import staticTimeline from "@/data/timeline.json";

export type PastEvent = {
  edition: number;
  year: number;
  title: string;
  date: string;
  location: string;
  slug?: string;
  sessionCount?: number;
  photoUrl?: string;
};

export async function getPastEvents(
  excludeSlug?: string
): Promise<PastEvent[]> {
  const dbRows = await db.query.eventYears.findMany({
    where: eq(eventYears.published, true),
    orderBy: asc(eventYears.year),
    with: {
      sessions: {
        where: eq(sessions.isPublished, true),
      },
      photos: {
        orderBy: asc(eventPhotos.order),
        limit: 1,
      },
    },
  });

  // Use DB edition field if set, fallback to sort order
  const dbEvents: PastEvent[] = dbRows.map((row, i) => ({
    edition: row.edition ?? i + 1,
    year: row.year ?? new Date(row.startDate!).getFullYear(),
    title: row.name,
    date: row.startDate
      ? new Intl.DateTimeFormat("en-US", {
          month: "long",
          day: "numeric",
          year: "numeric",
          timeZone: "Asia/Bangkok",
        }).format(new Date(row.startDate))
      : "",
    location: row.location ?? "",
    slug: row.slug,
    sessionCount: row.sessions?.length ?? 0,
    photoUrl: row.photos?.[0]?.imageUrl ?? undefined,
  }));

  // Dedupe: if DB has same year as static, prefer DB
  const dbYears = new Set(dbEvents.map((e) => e.year));
  const staticOnly: PastEvent[] = (staticTimeline as typeof staticTimeline)
    .filter((e) => !dbYears.has(e.year))
    .map((e) => ({
      edition: e.edition,
      year: e.year,
      title: e.title,
      date: e.date,
      location: e.location,
      photoUrl: (e as Record<string, unknown>).photoUrl as string | undefined,
    }));

  const merged = [...dbEvents, ...staticOnly].sort(
    (a, b) => b.edition - a.edition
  );

  if (excludeSlug) {
    return merged.filter((e) => e.slug !== excludeSlug);
  }

  return merged;
}
