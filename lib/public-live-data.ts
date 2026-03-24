import { and, asc, eq, gt, lte } from "drizzle-orm";

import { db } from "@/lib/db";
import type {
  EventYear as EventYearRow,
  Session as SessionRow,
  Venue as VenueRow,
} from "@/lib/db/schema";
import { eventYears, sessions, venues } from "@/lib/db/schema";
import { getCurrentServerTime } from "@/lib/time/ntp";

export interface PublicLiveEventYear
  extends Pick<
    EventYearRow,
    | "id"
    | "slug"
    | "name"
    | "location"
    | "timezone"
    | "startDate"
    | "endDate"
    | "published"
  > {}

interface PublicLiveScheduleSession
  extends Pick<
    SessionRow,
    | "id"
    | "title"
    | "description"
    | "speakerName"
    | "speakerBio"
    | "startAt"
    | "endAt"
    | "actualStartAt"
    | "actualEndAt"
    | "tags"
    | "livestreamUrl"
    | "venueId"
  > {
  venue: VenueRow | null;
}

interface PublicLiveStatusSession
  extends Pick<
    SessionRow,
    | "id"
    | "title"
    | "speakerName"
    | "startAt"
    | "endAt"
    | "actualStartAt"
    | "actualEndAt"
    | "tags"
    | "livestreamUrl"
  > {
  venue: VenueRow | null;
}

interface PublicLiveSerializedEventYear {
  id: string;
  slug: string;
  name: string;
  location: string | null;
  timezone: string;
  startDate: string | null;
  endDate: string | null;
}

interface PublicLiveSerializedScheduleSession {
  id: string;
  title: string;
  description: string | null;
  speakerName: string;
  speakerBio: string | null;
  startAt: string;
  endAt: string;
  actualStartAt: string | null;
  actualEndAt: string | null;
  tags: string[];
  livestreamUrl: string | null;
  venueId: string;
  venue: VenueRow | null;
}

interface PublicLiveSerializedStatusSession {
  id: string;
  title: string;
  speakerName: string;
  startAt: string;
  endAt: string;
  actualStartAt: string | null;
  actualEndAt: string | null;
  tags: string[];
  livestreamUrl: string | null;
  venue: VenueRow | null;
  progress?: number;
  startsIn?: string;
}

export interface PublicLiveScheduleData {
  eventYear: PublicLiveSerializedEventYear;
  venues: VenueRow[];
  sessions: PublicLiveSerializedScheduleSession[];
}

export interface PublicLiveStatusData {
  serverTime: string;
  timezone: string;
  onAir: PublicLiveSerializedStatusSession[];
  upNext: PublicLiveSerializedStatusSession[];
}

export async function getPublishedLiveEventYear(
  slug: string,
): Promise<PublicLiveEventYear | null> {
  const eventYear = await db.query.eventYears.findFirst({
    where: eq(eventYears.slug, slug),
    columns: {
      id: true,
      slug: true,
      name: true,
      location: true,
      timezone: true,
      startDate: true,
      endDate: true,
      published: true,
    },
  });

  if (!eventYear || !eventYear.published) {
    return null;
  }

  return eventYear;
}

export function serializeLiveEventYear(
  eventYear: PublicLiveEventYear,
): PublicLiveSerializedEventYear {
  return {
    id: eventYear.id,
    slug: eventYear.slug,
    name: eventYear.name,
    location: eventYear.location ?? null,
    timezone: eventYear.timezone,
    startDate: eventYear.startDate?.toISOString() ?? null,
    endDate: eventYear.endDate?.toISOString() ?? null,
  };
}

function serializeScheduleSession(
  session: PublicLiveScheduleSession,
): PublicLiveSerializedScheduleSession {
  return {
    id: session.id,
    title: session.title,
    description: session.description,
    speakerName: session.speakerName,
    speakerBio: session.speakerBio ?? null,
    startAt: session.startAt.toISOString(),
    endAt: session.endAt.toISOString(),
    actualStartAt: session.actualStartAt?.toISOString() ?? null,
    actualEndAt: session.actualEndAt?.toISOString() ?? null,
    tags: session.tags,
    livestreamUrl: session.livestreamUrl ?? null,
    venueId: session.venueId,
    venue: session.venue,
  };
}

function serializeStatusSession(
  session: PublicLiveStatusSession,
  now: Date,
): PublicLiveSerializedStatusSession {
  return {
    id: session.id,
    title: session.title,
    speakerName: session.speakerName,
    startAt: session.startAt.toISOString(),
    endAt: session.endAt.toISOString(),
    actualStartAt: session.actualStartAt?.toISOString() ?? null,
    actualEndAt: session.actualEndAt?.toISOString() ?? null,
    tags: session.tags,
    livestreamUrl: session.livestreamUrl ?? null,
    venue: session.venue,
    progress: calculateProgress(
      session.actualStartAt || session.startAt,
      session.endAt,
      now,
    ),
  };
}

export async function buildLiveScheduleData(
  eventYear: PublicLiveEventYear,
): Promise<PublicLiveScheduleData> {
  const [venuesList, sessionsList] = await Promise.all([
    db.query.venues.findMany({
      where: and(
        eq(venues.eventYearId, eventYear.id),
        eq(venues.isActive, true),
      ),
      orderBy: asc(venues.order),
    }),
    db.query.sessions.findMany({
      where: and(
        eq(sessions.eventYearId, eventYear.id),
        eq(sessions.isPublished, true),
      ),
      with: {
        venue: true,
      },
      orderBy: asc(sessions.startAt),
    }),
  ]);

  return {
    eventYear: serializeLiveEventYear(eventYear),
    venues: venuesList,
    sessions: sessionsList.map((session) =>
      serializeScheduleSession({
        ...session,
        venue: session.venue ?? null,
      }),
    ),
  };
}

export async function buildLiveStatusData(
  eventYear: PublicLiveEventYear,
  now: Date = getCurrentServerTime(),
): Promise<PublicLiveStatusData> {
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
    if (session.actualEndAt) return false;
    if (session.actualStartAt) return true;
    return new Date(session.startAt) <= now && new Date(session.endAt) > now;
  });

  const upNext = allSessions.filter(
    (session) => !session.actualStartAt && !session.actualEndAt && new Date(session.startAt) > now,
  );

  return {
    serverTime: now.toISOString(),
    timezone: eventYear.timezone,
    onAir: onAir.map((session) =>
      serializeStatusSession({
        ...session,
        venue: session.venue ?? null,
      }, now),
    ),
    upNext: upNext.map((session) => ({
      id: session.id,
      title: session.title,
      speakerName: session.speakerName,
      startAt: session.startAt.toISOString(),
      endAt: session.endAt.toISOString(),
      actualStartAt: session.actualStartAt?.toISOString() ?? null,
      actualEndAt: session.actualEndAt?.toISOString() ?? null,
      tags: session.tags,
      venue: session.venue,
      startsIn: calculateTimeUntil(session.startAt, now),
    })),
  };
}

export async function buildLiveViewerData(
  slug: string,
  now: Date = getCurrentServerTime(),
): Promise<
  | {
      schedule: PublicLiveScheduleData;
      status: PublicLiveStatusData;
    }
  | null
> {
  const eventYear = await getPublishedLiveEventYear(slug);

  if (!eventYear) {
    return null;
  }

  const [schedule, status] = await Promise.all([
    buildLiveScheduleData(eventYear),
    buildLiveStatusData(eventYear, now),
  ]);

  return { schedule, status };
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
