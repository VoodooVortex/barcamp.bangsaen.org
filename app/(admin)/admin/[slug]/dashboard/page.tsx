// Admin dashboard page
// Shows overview stats and quick actions
import { db, withRetry } from "@/lib/db";
import { eventYears, sessions, venues } from "@/lib/db/schema";
import { eq, and, count, gte, lte } from "drizzle-orm";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";
import {
  Mic2,
  MapPin,
  Clock,
  Activity,
  AlertCircle,
  AlertTriangle,
  ExternalLink,
} from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

interface DashboardPageProps {
  params: Promise<{ slug: string }>;
}

async function getDashboardData(slug: string) {
  return withRetry(
    async () => {
      const eventYear = await db.query.eventYears.findFirst({
        where: eq(eventYears.slug, slug),
      });

      if (!eventYear) {
        return null;
      }

      // Get counts in parallel
      const [
        [{ value: venuesCountRaw }],
        [{ value: activeVenuesCountRaw }],
        [{ value: sessionsCountRaw }],
        [{ value: publishedSessionsCountRaw }],
      ] = await Promise.all([
        db
          .select({ value: count() })
          .from(venues)
          .where(eq(venues.eventYearId, eventYear.id)),
        db
          .select({ value: count() })
          .from(venues)
          .where(
            and(
              eq(venues.eventYearId, eventYear.id),
              eq(venues.isActive, true),
            ),
          ),
        db
          .select({ value: count() })
          .from(sessions)
          .where(eq(sessions.eventYearId, eventYear.id)),
        db
          .select({ value: count() })
          .from(sessions)
          .where(
            and(
              eq(sessions.eventYearId, eventYear.id),
              eq(sessions.isPublished, true),
            ),
          ),
      ]);

      const draftSessionsCount = Number(sessionsCountRaw) - Number(publishedSessionsCountRaw);

      // Get next 5 upcoming sessions based strictly on time
      const now = new Date();

      let upcomingSessions = await db.query.sessions.findMany({
        where: and(
          eq(sessions.eventYearId, eventYear.id),
          eq(sessions.isPublished, true),
          gte(sessions.startAt, now)
        ),
        orderBy: (sessions, { asc }) => [asc(sessions.startAt)],
        with: {
          venue: true,
        },
        limit: 5,
      });

      let sessionsTitle = "Upcoming Sessions";

      // Fallback: If no upcoming sessions exist, show the 5 most recent past sessions
      if (upcomingSessions.length === 0) {
        upcomingSessions = await db.query.sessions.findMany({
          where: and(
            eq(sessions.eventYearId, eventYear.id),
            eq(sessions.isPublished, true),
            lte(sessions.startAt, now)
          ),
          orderBy: (sessions, { desc }) => [desc(sessions.startAt)],
          with: {
            venue: true,
          },
          limit: 5,
        });
        sessionsTitle = "Recent Past Sessions";
      }

      return {
        eventYear,
        stats: {
          venuesCount: Number(venuesCountRaw),
          activeVenuesCount: Number(activeVenuesCountRaw),
          sessionsCount: Number(sessionsCountRaw),
          publishedSessionsCount: Number(publishedSessionsCountRaw),
          draftSessionsCount: draftSessionsCount,
        },
        upcomingSessions,
        sessionsTitle,
      };
    },
    3,
    1000,
  );
}

export default async function DashboardPage({ params }: DashboardPageProps) {
  const { slug } = await params;

  let data;
  let error;

  try {
    data = await getDashboardData(slug);
  } catch (e) {
    error = e instanceof Error ? e.message : "Failed to load dashboard data";
    console.error("Dashboard error:", e);
  }

  if (error) {
    return (
      <div className="space-y-6">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Failed to load dashboard data. Please refresh the page or try again
            later.
            <br />
            <span className="text-sm opacity-70">{error}</span>
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="space-y-6">
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>Event year {slug} not found.</AlertDescription>
        </Alert>
      </div>
    );
  }

  const { stats, upcomingSessions, sessionsTitle } = data;

  const statsCards = [
    {
      title: "Total Sessions",
      value: stats.sessionsCount,
      published: stats.publishedSessionsCount,
      icon: Mic2,
      href: `/admin/${slug}/sessions`,
    },
    {
      title: "Venues/Rooms",
      value: stats.venuesCount,
      active: stats.activeVenuesCount,
      icon: MapPin,
      href: `/admin/${slug}/venues`,
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Dashboard</h2>
        <div className="flex items-center gap-3">
          <Link
            href={`/live/${slug}`}
            target="_blank"
            className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            <ExternalLink className="h-4 w-4" />
            View Live Page
          </Link>
          <div className="flex items-center gap-2">
            <Activity className="h-4 w-4 text-green-500" />
            <span className="text-sm text-muted-foreground">System Online</span>
          </div>
        </div>
      </div>

      {/* Needs Attention Alert */}
      {(stats.draftSessionsCount > 0 || stats.venuesCount === 0) && (
        <Alert
          variant="destructive"
          className="bg-destructive/10 text-destructive border-destructive/20"
        >
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Needs Attention</AlertTitle>
          <AlertDescription className="mt-2 flex flex-col gap-1">
            {stats.draftSessionsCount > 0 && (
              <span className="flex items-center gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-destructive flex-shrink-0" />
                {stats.draftSessionsCount} session{stats.draftSessionsCount > 1 ? "s are" : " is"} currently in Draft status and won&apos;t be visible to attendees.
              </span>
            )}
            {stats.venuesCount === 0 && (
              <span className="flex items-center gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-destructive flex-shrink-0" />
                No venues have been created yet. You need venues before adding sessions.
              </span>
            )}
          </AlertDescription>
        </Alert>
      )}

      {/* Stats cards */}
      <div className="grid gap-4 md:grid-cols-2">
        {statsCards.map((stat) => (
          <Link key={stat.title} href={stat.href} className="block h-full">
            <Card className="hover:shadow-md transition-shadow cursor-pointer h-full">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  {stat.title}
                </CardTitle>
                <stat.icon className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stat.value}</div>
                <p className="text-xs text-muted-foreground">
                  {"published" in stat && stat.published !== undefined
                    ? `${stat.published} published`
                    : "active" in stat && stat.active !== undefined
                      ? `${stat.active} active`
                      : null}
                </p>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      {/* Upcoming sessions */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Clock className="h-5 w-5" />
            {sessionsTitle}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {upcomingSessions.length > 0 ? (
            <div className="space-y-3">
              {upcomingSessions.map((session) => (
                <div
                  key={session.id}
                  className="flex flex-col sm:flex-row sm:items-center justify-between p-4 bg-white border border-primary/10 rounded-xl shadow-sm gap-3"
                >
                  <div className="space-y-1">
                    <p className="font-semibold text-lg text-primary">
                      {session.title}
                    </p>
                    <div className="flex items-center gap-2 text-sm text-primary/70">
                      <span className="font-medium text-primary/80">
                        {session.venue?.name}
                      </span>
                      <span className="text-primary/40">•</span>
                      <span>{session.speakerName}</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-center sm:justify-start px-3 py-1.5 bg-accent/20 text-accent-foreground font-medium text-sm rounded-full shrink-0 border border-accent/20">
                    <Clock className="h-3.5 w-3.5 mr-1.5" />
                    {new Date(session.startAt).toLocaleTimeString("en-US", {
                      hour: "2-digit",
                      minute: "2-digit",
                      hour12: false,
                    })}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-muted-foreground">
              No upcoming sessions in the next 24 hours
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
