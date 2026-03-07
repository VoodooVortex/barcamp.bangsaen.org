// On Air card component
// Displays currently running sessions with live indicator
"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Radio, MapPin, User, Clock, Hourglass } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface OnAirSession {
  id: string;
  title: string;
  speakerName: string;
  startAt: string;
  endAt: string;
  tags: string[];
  livestreamUrl?: string;
  venue: {
    id: string;
    name: string;
  };
  progress: number;
}

interface OnAirCardProps {
  session: OnAirSession;
}

interface TimeRemaining {
  hours: number;
  minutes: number;
  seconds: number;
  total: number;
}

function calculateTimeRemaining(endAt: string): TimeRemaining {
  const now = new Date().getTime();
  const end = new Date(endAt).getTime();
  const total = end - now;

  if (total <= 0) {
    return { hours: 0, minutes: 0, seconds: 0, total: 0 };
  }

  const hours = Math.floor(total / (1000 * 60 * 60));
  const minutes = Math.floor((total % (1000 * 60 * 60)) / (1000 * 60));
  const seconds = Math.floor((total % (1000 * 60)) / 1000);

  return { hours, minutes, seconds, total };
}

function formatTimeUnit(value: number): string {
  return value.toString().padStart(2, "0");
}

export function OnAirCard({ session }: OnAirCardProps) {
  const [isMounted, setIsMounted] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState<TimeRemaining>({
    hours: 0,
    minutes: 0,
    seconds: 0,
    total: 0,
  });

  useEffect(() => {
    setIsMounted(true);
    // Update immediately on mount
    setTimeRemaining(calculateTimeRemaining(session.endAt));

    // Update every second
    const interval = setInterval(() => {
      const remaining = calculateTimeRemaining(session.endAt);
      setTimeRemaining(remaining);

      // Stop interval when countdown reaches zero
      if (remaining.total <= 0) {
        clearInterval(interval);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [session.endAt]);

  const formatTime = (dateStr: string) => {
    return new Date(dateStr).toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    });
  };

  const formatTimeRemaining = () => {
    if (timeRemaining.total <= 0) {
      return "Ending now";
    }

    const parts: string[] = [];
    if (timeRemaining.hours > 0) {
      parts.push(`${timeRemaining.hours}h`);
    }
    parts.push(`${formatTimeUnit(timeRemaining.minutes)}m`);
    parts.push(`${formatTimeUnit(timeRemaining.seconds)}s`);
    return parts.join(" ");
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 15, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
      className="h-full"
    >
      <Card className="relative overflow-hidden border border-slate-200 dark:border-border bg-white dark:bg-card shadow-sm hover:shadow-md transition-shadow h-full">
        {/* Live indicator pulse */}
        <div className="absolute top-3 right-3 flex items-center gap-2">
          <span className="relative flex h-3 w-3">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
          </span>
          <span className="text-xs font-bold text-red-500 uppercase tracking-wider">
            Live
          </span>
        </div>

        <CardContent className="p-4 h-full flex flex-col">
          <div className="flex items-start gap-3 h-full">
            <div className="flex-shrink-0">
              <div className="h-11 w-11 rounded-full bg-slate-100 dark:bg-muted flex items-center justify-center border border-slate-200 dark:border-border shadow-sm">
                <Radio className="h-6 w-6 text-slate-500 dark:text-slate-400" />
              </div>
            </div>

            <div className="flex-1 min-w-0 flex flex-col h-full">
              {/* Title */}
              <h3 className="text-base sm:text-lg min-[1920px]:text-2xl font-bold leading-tight mb-2 pr-16 font-display text-[#1E293B] dark:text-foreground tracking-tight">
                {session.title}
              </h3>

              {/* Time Badge + Countdown in one row */}
              <div className="flex flex-wrap items-center gap-2 mb-2">
                <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-ocean/10 dark:bg-ocean/20 border border-ocean/20 dark:border-ocean/30">
                  <Clock className="h-3.5 w-3.5 text-ocean-dark dark:text-ocean-light" />
                  <span className="text-xs font-semibold min-[1920px]:text-sm text-ocean-dark dark:text-ocean-light">
                    {isMounted
                      ? `${formatTime(session.startAt)} - ${formatTime(session.endAt)}`
                      : "--:-- - --:--"}
                  </span>
                </div>
                <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-sunset-orange/10 dark:bg-sunset-orange/20 border border-sunset-orange/20 dark:border-sunset-orange/30">
                  <Hourglass className="h-3 w-3 text-sunset-orange dark:text-sunset-gold" />
                  <span className="text-xs font-semibold min-[1920px]:text-sm text-sunset-orange tabular-nums">
                    {isMounted ? formatTimeRemaining() : "--h --m --s"}
                  </span>
                </div>
              </div>

              {/* Speaker and Venue */}
              <div className="flex flex-wrap items-center gap-3 text-sm min-[1920px]:text-base text-slate-500 mb-2 mt-auto pt-2">
                <div className="flex items-center gap-1.5">
                  <User className="h-4 w-4 text-slate-400" />
                  <span className="font-medium text-slate-600 dark:text-slate-300">
                    {session.speakerName}
                  </span>
                </div>
                <div className="flex items-center gap-1.5">
                  <MapPin className="h-4 w-4 text-slate-400" />
                  <span className="font-medium text-slate-600 dark:text-slate-300">
                    {session.venue.name}
                  </span>
                </div>
              </div>

              {/* Tags */}
              <div className="flex flex-wrap items-center gap-1.5">
                {session.tags.slice(0, 2).map((tag) => (
                  <Badge
                    key={tag}
                    variant="secondary"
                    className="text-xs bg-sand/20 dark:bg-sand/30 text-sand-dark dark:text-sand-light hover:bg-sand/30 dark:hover:bg-sand/40"
                  >
                    {tag}
                  </Badge>
                ))}
                {session.tags.length > 2 && (
                  <Badge variant="secondary" className="text-xs bg-muted">
                    +{session.tags.length - 2}
                  </Badge>
                )}
              </div>
            </div>
          </div>

          {session.livestreamUrl && (
            <a
              href={session.livestreamUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-3 inline-flex items-center gap-2 text-sm text-ocean-dark dark:text-ocean-light hover:text-ocean font-medium transition-colors"
            >
              <Radio className="h-4 w-4" />
              Watch Livestream
            </a>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}
