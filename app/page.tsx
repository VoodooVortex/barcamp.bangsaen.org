// Home page for Barcamp Bangsaen
// Landing page with event info and links to live schedule
import { db } from "@/lib/db";
import { eventYears, sessions } from "@/lib/db/schema";
import { desc, eq } from "drizzle-orm";
// import Link from "next/link";
import { Hero } from "@/components/hero";
// import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
// import {
//   Radio,
//   Wifi,
//   Sparkles,
// } from "lucide-react";
import { EventTicket } from "@/components/event-ticket";

export default async function HomePage() {
  // Get published years
  const publishedYears = await db.query.eventYears.findMany({
    where: eq(eventYears.published, true),
    orderBy: desc(eventYears.createdAt),
    with: {
      venues: true,
      sessions: {
        where: eq(sessions.isPublished, true)
      }
    }
  });

  const latestYear = publishedYears[0]?.slug;
  const currentEvent = publishedYears[0];

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <Hero latestSlug={latestYear} />

      {/* Features Section */}
      {/*<section className="py-20 px-4 bg-background">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-display font-bold text-foreground mb-4">
              What to Expect
            </h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              Join us for a day of learning, sharing, and connecting with the
              tech community
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            <Card className="glass-card border-0 shadow-xl hover:shadow-2xl transition-shadow">
              <CardHeader className="pb-4">
                <div className="w-14 h-14 rounded-2xl bg-sunset-orange/10 flex items-center justify-center mb-4">
                  <Radio className="h-7 w-7 text-sunset-orange" />
                </div>
                <CardTitle className="font-display">Live Schedule</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground leading-relaxed">
                  Real-time session updates with On Air and Up Next indicators.
                  Never miss a talk with our live tracking.
                </p>
              </CardContent>
            </Card>

            <Card className="glass-card border-0 shadow-xl hover:shadow-2xl transition-shadow">
              <CardHeader className="pb-4">
                <div className="w-14 h-14 rounded-2xl bg-ocean/10 flex items-center justify-center mb-4">
                  <Wifi className="h-7 w-7 text-ocean" />
                </div>
                <CardTitle className="font-display">
                  Real-time Updates
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground leading-relaxed">
                  WebSocket-powered live updates. Schedule changes appear
                  instantly across all devices.
                </p>
              </CardContent>
            </Card>

            <Card className="glass-card border-0 shadow-xl hover:shadow-2xl transition-shadow">
              <CardHeader className="pb-4">
                <div className="w-14 h-14 rounded-2xl bg-sand/10 flex items-center justify-center mb-4">
                  <Sparkles className="h-7 w-7 text-sand-dark" />
                </div>
                <CardTitle className="font-display">Community Driven</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground leading-relaxed">
                  Barcamp is an unconference - anyone can present! Share your
                  knowledge or learn from others.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>*/}

      {/* Event Details Section */}
      {currentEvent && (
        <section className="py-20 px-4 bg-gradient-to-b from-sand-light/30 to-background">
          <div className="container mx-auto max-w-4xl">
            <div className="text-center mb-12">
              <Badge variant="secondary" className="mb-4 text-base px-4 py-1">
                {currentEvent.slug} Event
              </Badge>
              <h2 className="text-3xl md:text-4xl font-display font-bold text-foreground">
                {currentEvent.name}
              </h2>
            </div>

            {/* Ticket Style Event Card */}
            <EventTicket event={currentEvent} />
          </div>
        </section>
      )}

      {/* Past Events Section */}
      {/*{publishedYears.length > 1 && (
        <section className="py-16 px-4 bg-muted/50">
          <div className="container mx-auto max-w-4xl">
            <h2 className="text-2xl font-display font-bold text-center mb-8">
              Past Events
            </h2>
            <div className="flex flex-wrap justify-center gap-3">
              {publishedYears.slice(1).map((year) => (
                <Link key={year.id} href={`/live/${year.slug}`}>
                  <Badge
                    variant="outline"
                    className="text-base px-4 py-2 hover:bg-muted cursor-pointer transition-colors"
                  >
                    {year.name || year.slug}
                  </Badge>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}*/}

      {/* Footer */}
      <footer className="py-12 px-4 bg-silhouette text-sand-light">
        <div className="container mx-auto max-w-4xl text-center">
          <p className="font-display text-2xl font-bold mb-4">
            Barcamp Bangsaen
          </p>
          <p className="text-sand-light/70 mb-6">
            Beach meets technology. An unconference by the sea.
          </p>
          <div className="flex justify-center gap-6 text-sm text-sand-light/50">
            <span>Bangsaen, Thailand</span>
            <span>•</span>
            <span>Unconference</span>
            <span>•</span>
            <span>Community</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
