"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import Link from "next/link";

interface EventTicketProps {
  event: {
    slug: string;
    startDate: string | Date | null;
    endDate: string | Date | null;
    location: string | null;
    sessions: { id: string }[];
  };
}

export function EventTicket({ event }: EventTicketProps) {
  const [now, setNow] = useState(new Date());
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
    const interval = setInterval(() => setNow(new Date()), 60000);
    return () => clearInterval(interval);
  }, []);

  if (!event.startDate) return null;

  const start = new Date(event.startDate);
  const end = event.endDate ? new Date(event.endDate) : null;

  let countdownText = "";
  let isLive = false;
  let isEnded = false;

  if (end && now > end) {
    isEnded = true;
  } else if (now >= start) {
    isLive = true;
  } else {
    const diffMs = start.getTime() - now.getTime();
    const days = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diffMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    if (days > 0) countdownText = `arriving in ${days}d ${hours}h`;
    else countdownText = `arriving in ${hours}h`;
  }

  if (!isClient) countdownText = "";

  const dateStr = new Intl.DateTimeFormat("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
    timeZone: "Asia/Bangkok",
  }).format(start);

  const shortDateStr = new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "2-digit",
    timeZone: "Asia/Bangkok",
  }).format(start).toUpperCase();

  const timeStr = (() => {
    const opts: Intl.DateTimeFormatOptions = {
      hour: "numeric",
      minute: "2-digit",
      timeZone: "Asia/Bangkok",
    };
    const s = new Intl.DateTimeFormat("en-US", opts).format(start);
    if (end) {
      const e = new Intl.DateTimeFormat("en-US", opts).format(end);
      return `${s} – ${e}`;
    }
    return s;
  })();

  const sessionCount = event.sessions?.length ?? 0;

  return (
    <motion.div
      initial={{ opacity: 0, rotate: -2, y: 20 }}
      whileInView={{ opacity: 1, rotate: 0, y: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      className="relative mt-8"
    >
      <div
        className="relative flex flex-col md:flex-row overflow-hidden rounded-lg border border-border bg-card shadow-2xl"
        style={{
          boxShadow:
            "0 20px 60px -15px rgba(0,0,0,0.25), 0 4px 10px -5px rgba(0,0,0,0.1)",
        }}
      >
        {/* FRONT (left) — scenic */}
        <div className="relative md:w-[55%] min-h-[260px] md:min-h-[340px] overflow-hidden bg-sky-gradient">
          {/* Sun */}
          <div className="absolute top-8 right-10 h-16 w-16 rounded-full bg-sunset-gold shadow-[0_0_60px_20px_rgba(246,183,60,0.5)]" />

          {/* Ocean band */}
          <div className="absolute bottom-0 left-0 right-0 h-1/3 bg-gradient-to-b from-ocean/60 to-ocean-dark/80" />

          {/* Sand */}
          <div className="absolute bottom-0 left-0 right-0 h-[18%] bg-gradient-to-b from-sand-light to-sand" />

          {/* Wave lines */}
          <svg
            className="absolute bottom-[18%] left-0 right-0 w-full h-4 text-sand-light/60"
            viewBox="0 0 400 16"
            preserveAspectRatio="none"
          >
            <path
              d="M0 8 Q 25 0 50 8 T 100 8 T 150 8 T 200 8 T 250 8 T 300 8 T 350 8 T 400 8"
              stroke="currentColor"
              strokeWidth="1.5"
              fill="none"
            />
          </svg>

          {/* Palm silhouette */}
          <div className="absolute bottom-[14%] left-6 md:left-10 text-5xl md:text-7xl select-none">
            🌴
          </div>

          {/* Headline */}
          <div className="relative z-10 p-6 md:p-8 text-shadow">
            <p className="font-mono text-[10px] md:text-xs uppercase tracking-[0.3em] text-white/90 mb-2">
              Greetings from
            </p>
            <h3
              className="font-display text-4xl md:text-6xl font-black text-white leading-none italic"
              style={{ textShadow: "0 3px 12px rgba(0,0,0,0.4)" }}
            >
              Bangsaen
            </h3>
            <p className="mt-3 font-display italic text-white/90 text-sm md:text-base">
              Beach meets technology
            </p>
          </div>

          {/* Corner tag */}
          <div className="absolute bottom-4 right-4 z-10 font-mono text-[9px] uppercase tracking-widest text-white/70">
            Chonburi · Thailand
          </div>
        </div>

        {/* Divider (postcard fold) */}
        <div className="hidden md:block w-px bg-border relative">
          <div className="absolute inset-y-0 left-1/2 -translate-x-1/2 w-px border-l border-dashed border-border" />
        </div>

        {/* BACK (right) — written side */}
        <div className="relative flex-1 bg-card p-6 md:p-8">
          {/* Stamp */}
          <div className="absolute top-4 right-4 md:top-5 md:right-5 w-16 h-20 md:w-20 md:h-24 bg-sunset-coral border-[3px] border-dashed border-card shadow-md flex flex-col items-center justify-center text-white">
            <span className="font-display text-2xl md:text-3xl font-black leading-none">
              #4
            </span>
            <span className="font-mono text-[8px] md:text-[9px] tracking-widest mt-1">
              BARCAMP
            </span>
            <span className="font-mono text-[8px] md:text-[9px]">★ ★ ★</span>
          </div>

          {/* Postmark */}
          <div
            className={`absolute top-6 right-24 md:top-8 md:right-28 w-20 h-20 md:w-24 md:h-24 rounded-full border-[2px] flex flex-col items-center justify-center rotate-[-8deg] ${
              isLive
                ? "border-destructive text-destructive"
                : isEnded
                  ? "border-ocean-dark text-ocean-dark"
                  : "border-sand-dark/60 text-sand-dark/80"
            }`}
          >
            <span className="font-mono text-[8px] md:text-[9px] tracking-widest uppercase">
              {isLive ? "Live Now" : isEnded ? "Delivered" : "Posted"}
            </span>
            <span className="font-mono text-[10px] md:text-xs font-bold mt-0.5">
              {shortDateStr}
            </span>
            <div className="w-full border-t border-current my-0.5 opacity-50" />
            <span className="font-mono text-[7px] md:text-[8px] tracking-wider">
              BSN · TH
            </span>
          </div>

          {/* Message */}
          <div className="pr-2 md:pr-4 max-w-[60%] md:max-w-[55%]">
            <p className="font-display italic text-base md:text-lg text-foreground leading-snug">
              Dear friend,
            </p>
            <p className="mt-2 font-display italic text-sm md:text-base text-muted-foreground leading-relaxed">
              Wish you were here at{" "}
              <span className="text-foreground font-bold not-italic">
                Barcamp Bangsaen #4
              </span>
              .
            </p>
          </div>

          {/* Details (address-block style) */}
          <div className="mt-6 md:mt-8 space-y-2 font-mono text-xs md:text-sm">
            <div className="flex gap-3">
              <span className="text-muted-foreground w-16 shrink-0">WHEN</span>
              <span className="text-foreground font-semibold border-b border-dashed border-border flex-1 pb-0.5">
                {dateStr} · {timeStr}
              </span>
            </div>
            <div className="flex gap-3">
              <span className="text-muted-foreground w-16 shrink-0">WHERE</span>
              <span className="text-foreground font-semibold border-b border-dashed border-border flex-1 pb-0.5 truncate">
                {event.location || "TBA"}
              </span>
            </div>
            <div className="flex gap-3">
              <span className="text-muted-foreground w-16 shrink-0">TALKS</span>
              <span className="text-foreground font-semibold border-b border-dashed border-border flex-1 pb-0.5">
                {sessionCount > 0 ? `${sessionCount} sessions` : "TBA"}
              </span>
            </div>
          </div>

          {/* Countdown / CTA */}
          <div className="mt-6 flex items-center justify-between gap-3">
            {countdownText && !isLive && !isEnded && (
              <p className="font-display italic text-xs md:text-sm text-sunset-orange">
                {countdownText}
              </p>
            )}
            {isEnded && (
              <p className="font-display italic text-xs md:text-sm text-muted-foreground">
                Thank you for joining ♡
              </p>
            )}
            {isLive && (
              <Link
                href={`/live/${event.slug}`}
                className="inline-flex items-center gap-2 rounded-full bg-sunset-orange px-5 py-2 text-xs md:text-sm font-bold text-white shadow-md transition hover:bg-sunset-orange/90"
              >
                Watch Live →
              </Link>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
}
