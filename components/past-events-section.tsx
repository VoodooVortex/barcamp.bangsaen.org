"use client";

import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { Calendar, MapPin, ArrowRight } from "lucide-react";
import type { PastEvent } from "@/lib/data/past-events";

// Beach-themed gradient backgrounds per edition
const editionGradients = [
  "from-ocean-dark via-ocean to-ocean-light", // edition 1
  "from-sunset-coral via-sunset-orange to-sunset-gold", // edition 2
  "from-ocean via-ocean-light to-sand-light", // edition 3
  "from-sunset-orange via-sunset-coral to-sunset-pink", // edition 4
];

function getGradient(edition: number) {
  return editionGradients[(edition - 1) % editionGradients.length];
}

function EventCard({
  event,
  index,
}: {
  event: PastEvent;
  index: number;
}) {
  const hasLink = !!event.slug;
  const gradient = getGradient(event.edition);

  const card = (
    <motion.article
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      whileHover={hasLink ? { y: -6, transition: { duration: 0.2 } } : undefined}
      className={`group relative overflow-hidden rounded-2xl border border-border bg-card shadow-md transition-all duration-300 ${
        hasLink
          ? "cursor-pointer hover:shadow-xl hover:border-sunset-orange/40"
          : "opacity-75"
      }`}
    >
      {/* Cover area */}
      <div className={`relative h-36 md:h-44 overflow-hidden bg-gradient-to-br ${gradient}`}>
        {event.photoUrl ? (
          <Image
            src={event.photoUrl}
            alt={event.title}
            fill
            className="object-cover opacity-90 group-hover:scale-105 transition-transform duration-500"
          />
        ) : (
          /* Decorative beach scene placeholder */
          <div className="absolute inset-0 flex items-end justify-center overflow-hidden">
            {/* Waves */}
            <svg
              className="absolute bottom-0 left-0 w-full h-12 text-white/15"
              viewBox="0 0 400 40"
              preserveAspectRatio="none"
            >
              <path
                d="M0,20 Q50,0 100,20 T200,20 T300,20 T400,20 L400,40 L0,40 Z"
                fill="currentColor"
              />
            </svg>
            {/* Palm emoji */}
            <span className="absolute top-4 right-5 text-3xl opacity-30 select-none">
              🌴
            </span>
          </div>
        )}

        {/* Edition badge */}
        {event.edition > 0 && (
          <div className="absolute top-3 left-3 z-10">
            <span className="inline-flex items-center gap-1 rounded-full bg-silhouette/70 backdrop-blur-sm px-3 py-1 text-xs font-bold text-white font-mono tracking-wider">
              #{event.edition}
            </span>
          </div>
        )}

        {/* Year overlay */}
        <span className="absolute bottom-3 right-4 z-10 font-display text-4xl md:text-5xl font-black text-white/50 leading-none select-none">
          {event.year}
        </span>
      </div>

      {/* Info */}
      <div className="p-4 md:p-5">
        <h3 className="font-display text-base md:text-lg font-bold text-foreground leading-tight mb-2">
          {event.title}
        </h3>
        <div className="space-y-1.5 text-xs md:text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <Calendar className="h-3.5 w-3.5 text-sunset-orange shrink-0" />
            <span>{event.date}</span>
          </div>
          <div className="flex items-start gap-2">
            <MapPin className="h-3.5 w-3.5 text-ocean shrink-0 mt-0.5" />
            <span className="line-clamp-2">{event.location}</span>
          </div>
        </div>

        {/* Stats + link hint */}
        {hasLink && (
          <div className="mt-3 pt-3 border-t border-border flex items-center justify-between">
            {event.sessionCount ? (
              <span className="text-xs text-muted-foreground font-mono">
                {event.sessionCount} sessions
              </span>
            ) : (
              <span />
            )}
            <span className="inline-flex items-center gap-1 text-xs font-semibold text-sunset-orange opacity-0 group-hover:opacity-100 transition-opacity">
              View event
              <ArrowRight className="h-3 w-3" />
            </span>
          </div>
        )}
      </div>
    </motion.article>
  );

  if (hasLink) {
    return <Link href={`/live/${event.slug}`}>{card}</Link>;
  }

  return card;
}

export function PastEventsSection({ events }: { events: PastEvent[] }) {
  if (events.length === 0) return null;

  return (
    <section className="py-16 md:py-20 px-4 bg-gradient-to-b from-sand-light/40 via-sand-light/20 to-background">
      <div className="container mx-auto max-w-5xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.5 }}
          className="text-center mb-10 md:mb-12"
        >
          <span className="inline-block mb-3 font-mono text-xs tracking-[0.2em] uppercase text-sunset-orange">
            Our Journey
          </span>
          <h2 className="text-2xl md:text-4xl font-display font-bold text-foreground">
            Past Events
          </h2>
          <p className="mt-2 text-sm md:text-base text-muted-foreground">
            A look back at every edition of Barcamp Bangsaen
          </p>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 md:gap-6">
          {events.map((event, i) => (
            <EventCard key={event.edition} event={event} index={i} />
          ))}
        </div>
      </div>
    </section>
  );
}
