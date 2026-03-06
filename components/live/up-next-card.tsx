// Up Next card component
// Displays upcoming sessions
"use client";

import { motion } from "framer-motion";
import { Clock, MapPin, User, ArrowRight } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CountdownTimer } from "./countdown-timer";

interface UpNextSession {
  id: string;
  title: string;
  speakerName: string;
  startAt: string;
  endAt: string;
  tags: string[];
  venue: {
    id: string;
    name: string;
  };
  startsIn: string;
}

interface UpNextCardProps {
  session: UpNextSession;
}

export function UpNextCard({ session }: UpNextCardProps) {
  const formatTime = (dateStr: string) => {
    return new Date(dateStr).toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    });
  };


  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 15, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
    >
      <Card className="group hover:shadow-md transition-all border border-slate-200 dark:border-border bg-white dark:bg-card shadow-sm">
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <div className="flex-shrink-0">
              <div className="h-10 w-10 rounded-full bg-slate-100 flex items-center justify-center border border-slate-200 dark:border-border">
                <ArrowRight className="h-5 w-5 text-slate-500" />
              </div>
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-2 mb-2">
                <h4 className="text-base sm:text-lg font-bold leading-tight font-display text-[#1E293B] tracking-tight flex-1">
                  {session.title}
                </h4>
                <CountdownTimer targetTime={session.startAt} />
              </div>

              {/* Time Badge - More prominent */}
              <div className="flex items-center gap-2 mb-2">
                <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-sand/10 border border-sand/20">
                  <Clock className="h-3.5 w-3.5 text-sand-dark" />
                  <span className="text-xs font-semibold text-sand-dark">
                    {formatTime(session.startAt)} - {formatTime(session.endAt)}
                  </span>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-3 text-sm text-slate-500 mb-2">
                <div className="flex items-center gap-1.5">
                  <div className="h-5 w-5 rounded-full bg-slate-50 dark:bg-muted flex items-center justify-center border border-slate-200 dark:border-border">
                    <User className="h-3 w-3 text-slate-400" />
                  </div>
                  <span className="font-medium text-slate-600 dark:text-slate-300">{session.speakerName}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="h-5 w-5 rounded-full bg-slate-50 dark:bg-muted flex items-center justify-center border border-slate-200 dark:border-border">
                    <MapPin className="h-3 w-3 text-slate-400" />
                  </div>
                  <span className="font-medium text-slate-600 dark:text-slate-300">{session.venue.name}</span>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-1">
                {session.tags.slice(0, 2).map((tag) => (
                  <Badge
                    key={tag}
                    variant="secondary"
                    className="text-xs bg-ocean/10 text-ocean-dark"
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
        </CardContent>
      </Card>
    </motion.div>
  );
}
