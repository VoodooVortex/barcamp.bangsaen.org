// Home page for Barcamp Bangsaen
// Landing page with event info and links to live sessions
import { db } from "@/lib/db";
import { eventYears, sessions, eventPhotos } from "@/lib/db/schema";
import { desc, eq, asc } from "drizzle-orm";
import Link from "next/link";
import { Hero } from "@/components/hero";

export const dynamic = "force-dynamic";

import { Badge } from "@/components/ui/badge";
import { ArrowRight } from "lucide-react";
import { FaFacebook, FaInstagram } from "react-icons/fa6";
import { EventTicket } from "@/components/event-ticket";
import { PhotoGallery } from "@/components/photo-gallery";
import { FeaturesSection } from "@/components/features-section";
import { FAQSection } from "@/components/faq-section";
import { TimelineSection } from "@/components/timeline-section";
import { SponsorsSection } from "@/components/sponsors-section";
import { ThemeSwitcher } from "@/components/theme-switcher";

const socialLinks = [
  {
    label: "Facebook",
    href: "https://www.facebook.com/profile.php?id=100088318882446",
    Icon: FaFacebook,
  },
  {
    label: "Instagram",
    href: "https://www.instagram.com/barcamp_bangsaen",
    Icon: FaInstagram,
  },
];

export default async function HomePage() {
  // Get published years
  const publishedYears = await db.query.eventYears.findMany({
    where: eq(eventYears.published, true),
    orderBy: desc(eventYears.createdAt),
    with: {
      venues: true,
      sessions: {
        where: eq(sessions.isPublished, true),
      },
      photos: {
        orderBy: asc(eventPhotos.order),
      },
    },
  });

  const latestYear = publishedYears[0]?.slug;
  const currentEvent = publishedYears[0];
  const currentPhotos = publishedYears[0]?.photos ?? [];

  return (
    <div className="min-h-screen">
      <div className="fixed bottom-4 right-4 z-50 rounded-full bg-background/80 backdrop-blur-sm border border-border shadow-sm">
        <ThemeSwitcher />
      </div>

      {/* Hero Section */}
      <Hero latestSlug={latestYear} />

      {/* Features Section — What to Expect */}
      <FeaturesSection />

      {/* Event Details Section */}
      {currentEvent && (
        <section className="py-20 px-4 bg-gradient-to-b from-sand-light/30 to-background">
          <div className="container mx-auto max-w-4xl">
            <div className="text-center mb-10">
              <Badge variant="secondary" className="mb-4 text-base px-4 py-1">
                {currentEvent.slug} Event
              </Badge>
              <h2 className="text-2xl md:text-4xl font-display font-bold text-foreground">
                {currentEvent.name}
              </h2>
            </div>

            {/* Ticket Style Event Card */}
            <EventTicket event={currentEvent} />
          </div>
        </section>
      )}

      {/* Photo Highlights Section — dark bg to make photos pop */}
      {currentEvent && currentPhotos.length > 0 && (
        <section className="py-20 px-4 bg-silhouette text-sand-light">
          <div className="container mx-auto max-w-6xl">
            <div className="text-center mb-10">
              <Badge
                variant="outline"
                className="mb-4 text-base px-4 py-1 border-sand-light/30 text-sand-light/80"
              >
                Photo Highlights
              </Badge>
              <h2 className="text-2xl md:text-4xl font-display font-bold text-sand-light">
                Moments from {currentEvent.name}
              </h2>
            </div>
            <PhotoGallery photos={currentPhotos.slice(0, 6)} />
            {currentPhotos.length > 6 && (
              <div className="text-center mt-8">
                <Link
                  href={`/live/${latestYear}`}
                  className="inline-flex items-center gap-2 text-sm font-medium text-sand-light/60 hover:text-sand-light transition-colors"
                >
                  View all {currentPhotos.length} photos
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            )}
          </div>
        </section>
      )}

      {/* CTA Banner — Join Us */}
      <section className="py-16 px-4 bg-gradient-to-b from-ocean-dark to-silhouette text-sand-light">
        <div className="container mx-auto max-w-3xl text-center">
          <h2 className="text-2xl md:text-4xl font-display font-bold text-sand-light mb-4">
            Connect the Dots
          </h2>
          <p className="text-sand-light/70 text-sm md:text-base mb-8">
            Barcamp Bangsaen เปิดให้ทุกคนเข้าร่วมฟรี!
          </p>
          <a
            href="https://www.facebook.com/profile.php?id=100088318882446"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-8 py-3 rounded-full bg-sunset-orange text-white font-semibold shadow-lg hover:shadow-xl hover:bg-sunset-orange/90 transition-all duration-200 text-sm md:text-base"
          >
            <FaFacebook className="h-5 w-5" />
            Follow us on Facebook
          </a>
        </div>
      </section>

      {/* Timeline Section — Event History */}
      <TimelineSection />

      {/* Sponsors Section */}
      <SponsorsSection />

      {/* FAQ Section */}
      <FAQSection />

      {/* Footer */}
      <footer className="py-6 px-4 bg-silhouette text-sand-light">
        <div className="container mx-auto max-w-4xl text-center">
          <p className="font-display text-lg font-bold mb-2">
            Barcamp Bangsaen
          </p>
          <p className="text-sand-light/70 text-sm mb-3">
            Beach meets technology. An unconference by the sea.
          </p>

          <div className="flex justify-center gap-3 mb-3">
            {socialLinks.map(({ href, label, Icon }) => (
              <a
                key={label}
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={`Barcamp Bangsaen on ${label}`}
                className="flex items-center justify-center h-8 w-8 rounded-full bg-sand-light/10 hover:bg-sand-light/20 transition-colors"
              >
                <Icon className="h-4 w-4" aria-hidden="true" />
              </a>
            ))}
          </div>

          <p className="text-sand-light/60 text-xs mb-3 font-medium">
            #BarcampBangsaen
          </p>

          <div className="flex justify-center gap-2 md:gap-3 text-xs text-sand-light/50">
            <span>Bangsaen, Thailand</span>
            <span>&middot;</span>
            <span>Unconference</span>
            <span>&middot;</span>
            <span>Community</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
