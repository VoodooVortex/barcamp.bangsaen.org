"use client";

import { motion } from "framer-motion";
import { Calendar, Clock, MapPin } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { timelineEvents, type TimelineEvent } from "@/lib/data/timeline";

export function TimelineSection() {
  return (
    <section className="py-20 px-4 bg-background">
      <div className="container mx-auto max-w-5xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.5 }}
          className="text-center mb-12"
        >
          <Badge variant="secondary" className="mb-4 text-base px-4 py-1">
            Our Journey
          </Badge>
          <h2 className="text-2xl md:text-4xl font-display font-bold text-foreground">
            Event History
          </h2>
          <p className="mt-3 text-sm md:text-base text-muted-foreground">
            A look back at every edition of Barcamp Bangsaen
          </p>
        </motion.div>

        <ol className="relative space-y-12">
          {/* Vertical line — uses the same 3-col grid trick via a full-height absolute element */}
          <div
            aria-hidden
            className="absolute left-[23px] md:left-1/2 top-0 bottom-0 w-0.5 md:-translate-x-1/2 bg-border"
          />

          {timelineEvents.map((event, i) => (
            <TimelineItem
              key={event.edition}
              event={event}
              alignRight={i % 2 === 0}
              delay={i * 0.1}
            />
          ))}
        </ol>
      </div>
    </section>
  );
}

function TimelineItem({
  event,
  alignRight,
  delay,
}: {
  event: TimelineEvent;
  alignRight: boolean;
  delay: number;
}) {
  const rows = [
    { Icon: Calendar, value: event.date },
    { Icon: Clock, value: event.time },
    { Icon: MapPin, value: event.location },
  ];

  // card อยู่ฝั่งขวา → ปีอยู่ซ้าย (ใกล้เส้นกลาง) → ปกติ
  // card อยู่ฝั่งซ้าย → ปีอยู่ขวา (ใกล้เส้นกลาง) → reverse
  const headerDirection = alignRight ? "" : "md:flex-row-reverse";

  return (
    <li className="relative pl-12 md:pl-0 md:grid md:grid-cols-[1fr_24px_1fr] md:gap-6">
      {/* Dot */}
      <motion.span
        aria-hidden
        initial={{ scale: 0, opacity: 0 }}
        whileInView={{ scale: 1, opacity: 1 }}
        viewport={{ once: true, margin: "-20px" }}
        transition={{
          duration: 0.4,
          delay,
          type: "spring",
          stiffness: 200,
        }}
        className="absolute left-[14px] top-8 h-5 w-5 rounded-full bg-sunset-orange border-4 border-background z-10 md:static md:col-start-2 md:row-start-1 md:self-center md:justify-self-center"
      />

      {/* Card */}
      <motion.div
        initial={{
          opacity: 0,
          x: alignRight ? 40 : -40,
        }}
        whileInView={{ opacity: 1, x: 0 }}
        viewport={{ once: true, margin: "-80px" }}
        transition={{
          duration: 0.5,
          delay,
          ease: "easeOut",
        }}
        className={
          alignRight
            ? "md:col-start-3 md:row-start-1"
            : "md:col-start-1 md:row-start-1"
        }
      >
        <motion.article
          whileHover={{ y: -4, transition: { duration: 0.2 } }}
          className="rounded-2xl border border-border bg-card p-5 shadow-sm hover:shadow-lg transition-shadow duration-200"
        >
          <header className={`flex flex-col md:flex-row md:items-baseline md:justify-between gap-1 md:gap-3 mb-3 ${headerDirection}`}>
            <span className="font-display text-2xl font-bold text-sunset-orange leading-none tracking-tight">
              {event.year}
            </span>
            <h3 className="font-display text-base md:text-xl font-bold text-foreground leading-tight">
              {event.title}
            </h3>
          </header>

          <div className="h-px bg-border mb-3" />

          <ul className="space-y-2 text-sm text-muted-foreground">
            {rows.map(({ Icon, value }, r) => (
              <li key={r} className="flex items-start gap-2">
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-sunset-orange/10 text-sunset-orange">
                  <Icon className="h-3 w-3" />
                </span>
                <span className="pt-0.5 leading-relaxed break-words min-w-0">
                  {value}
                </span>
              </li>
            ))}
          </ul>
        </motion.article>
      </motion.div>
    </li>
  );
}
