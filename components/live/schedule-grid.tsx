// Schedule grid component
// Displays sessions organized by venue and time
"use client";

import { useMemo } from "react";
import { motion } from "framer-motion";
import { MapPin } from "lucide-react";
import { SessionBlock } from "./session-block";

interface Venue {
  id: string;
  name: string;
  order: number;
}

interface Session {
  id: string;
  title: string;
  speakerName: string;
  startAt: string;
  endAt: string;
  actualStartAt?: string | null;
  actualEndAt?: string | null;
  tags: string[];
  description?: string | null;
  venueId: string;
}

interface ScheduleGridProps {
  venues: Venue[];
  sessions: Session[];
  currentTime: Date;
  selectedVenue?: string;
  searchQuery?: string;
  selectedTags?: string[];
}

export function ScheduleGrid({
  venues,
  sessions,
  currentTime,
  selectedVenue,
  searchQuery,
  selectedTags,
}: ScheduleGridProps) {
  // Filter sessions
  const filteredSessions = useMemo(() => {
    return sessions.filter((session) => {
      // Venue filter
      if (selectedVenue && session.venueId !== selectedVenue) {
        return false;
      }

      // Search filter
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        const matchesTitle = session.title.toLowerCase().includes(query);
        const matchesSpeaker = session.speakerName
          .toLowerCase()
          .includes(query);
        if (!matchesTitle && !matchesSpeaker) {
          return false;
        }
      }

      // Tag filter
      if (selectedTags && selectedTags.length > 0) {
        const hasTag = selectedTags.some((tag) => session.tags.includes(tag));
        if (!hasTag) {
          return false;
        }
      }

      return true;
    });
  }, [sessions, selectedVenue, searchQuery, selectedTags]);

  // Group sessions by venue
  const sessionsByVenue = useMemo(() => {
    const grouped: Record<string, Session[]> = {};

    for (const venue of venues) {
      grouped[venue.id] = filteredSessions.filter(
        (s) => s.venueId === venue.id,
      );
    }

    return grouped;
  }, [filteredSessions, venues]);

  // Get all unique time slots
  const timeSlots = useMemo(() => {
    const times = new Set<string>();

    for (const session of filteredSessions) {
      times.add(session.startAt);
    }

    return Array.from(times).sort(
      (a, b) => new Date(a).getTime() - new Date(b).getTime(),
    );
  }, [filteredSessions]);

  // Check if session is currently on air
  const isOnAir = (session: Session) => {
    if (session.actualEndAt) return false; // Manually ended
    if (session.actualStartAt) return true; // Manually started, not ended
    const start = new Date(session.startAt);
    const end = new Date(session.endAt);
    return start <= currentTime && end > currentTime;
  };

  // Check if session has passed
  const isPast = (session: Session) => {
    if (session.actualEndAt) return true; // Manually ended
    if (session.actualStartAt) return false; // Manually started, still running
    const end = new Date(session.endAt);
    return end <= currentTime;
  };

  const formatTimeSlot = (timeStr: string) => {
    return new Date(timeStr).toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    });
  };

  const getDateKey = (timeStr: string) => {
    const d = new Date(timeStr);
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
  };

  const formatDateHeader = (timeStr: string) => {
    return new Date(timeStr).toLocaleDateString("en-US", {
      weekday: "short",
      month: "short",
      day: "numeric",
    });
  };

  // Check if sessions span multiple days
  const hasMultipleDays = useMemo(() => {
    if (timeSlots.length === 0) return false;
    const firstDate = getDateKey(timeSlots[0]);
    return timeSlots.some((t) => getDateKey(t) !== firstDate);
  }, [timeSlots]);

  // Group time slots by date
  const timeSlotsGroupedByDate = useMemo(() => {
    const groups: Array<{ date: string; dateLabel: string; slots: string[] }> = [];
    let currentDate = "";

    for (const slot of timeSlots) {
      const dateKey = getDateKey(slot);
      if (dateKey !== currentDate) {
        currentDate = dateKey;
        groups.push({ date: dateKey, dateLabel: formatDateHeader(slot), slots: [] });
      }
      groups[groups.length - 1].slots.push(slot);
    }

    return groups;
  }, [timeSlots]);

  if (filteredSessions.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">No sessions found</p>
        <p className="text-sm text-muted-foreground">
          Try adjusting your filters
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Desktop view: Grid */}
      <div className="hidden md:block w-full overflow-x-auto pb-4">
        <div
          className="grid min-w-[800px] lg:min-w-full relative"
          style={{ gridTemplateColumns: `100px repeat(${venues.length}, 1fr)` }}
        >
          {/* Header row */}
          <div className="sticky top-0 z-10 bg-[#FFFDF5]/95 backdrop-blur supports-[backdrop-filter]:bg-[#FFFDF5]/60 border-b border-r border-slate-200 dark:border-border">
            <div className="h-10"></div>
          </div>
          {venues.map((venue, index) => (
            <div
              key={venue.id}
              className={`sticky top-0 z-10 bg-white dark:bg-card shadow-sm p-3 border-b border-slate-200 dark:border-border ${index > 0 ? "border-l border-slate-200 dark:border-border" : ""}`}
            >
              <div className="flex items-center gap-1 text-sm font-bold text-[#1E293B]">
                <MapPin className="h-3.5 w-3.5 text-[#B45309]" />
                {venue.name}
              </div>
            </div>
          ))}

          {/* Time slots grouped by date */}
          {timeSlotsGroupedByDate.map((dateGroup) => (
            <div key={dateGroup.date} className="contents">
              {/* Date header row - only show if multiple days */}
              {hasMultipleDays && (
                <div
                  className="py-2 border-b border-[#D4A373]/30"
                  style={{ gridColumn: `1 / -1` }}
                >
                  <span className="text-sm font-bold text-[#B45309] bg-[#FEFAE0] px-3 py-1 rounded-full">
                    {dateGroup.dateLabel}
                  </span>
                </div>
              )}

              {dateGroup.slots.map((timeSlot) => (
                <motion.div
                  key={timeSlot}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="contents"
                >
                  {/* Time label */}
                  <div className="text-sm font-bold text-slate-500 py-3 pr-4 border-r border-slate-200 dark:border-border border-b flex items-start">
                    {formatTimeSlot(timeSlot)}
                  </div>

                  {/* Sessions for each venue */}
                  {venues.map((venue, index) => {
                    const venueSessions = sessionsByVenue[venue.id]?.filter(
                      (s) => s.startAt === timeSlot,
                    );

                    return (
                      <div key={venue.id} className={`p-3 border-b border-slate-200 dark:border-border ${index > 0 ? "border-l" : ""}`}>
                        {venueSessions?.map((session) => (
                          <SessionBlock
                            key={session.id}
                            session={session}
                            isOnAir={isOnAir(session)}
                            isPast={isPast(session)}
                          />
                        ))}
                      </div>
                    );
                  })}
                </motion.div>
              ))}
            </div>
          ))}
        </div>
      </div>

      {/* Mobile view: List */}
      <div className="md:hidden space-y-4">
        {timeSlotsGroupedByDate.map((dateGroup) => (
          <div key={dateGroup.date} className="space-y-4">
            {/* Date header - only show if multiple days */}
            {hasMultipleDays && (
              <div className="py-1">
                <span className="text-sm font-bold text-[#B45309] bg-[#FEFAE0] px-3 py-1 rounded-full">
                  {dateGroup.dateLabel}
                </span>
              </div>
            )}

            {venues.map((venue) => {
              const venueSessions = (sessionsByVenue[venue.id] || []).filter((s) =>
                dateGroup.slots.includes(s.startAt)
              );

              if (venueSessions.length === 0) return null;

              return (
                <div key={venue.id} className="space-y-2">
                  <h3 className="font-bold text-sm flex items-center gap-1 px-2 text-[#1E293B]">
                    <MapPin className="h-3.5 w-3.5 text-[#B45309]" />
                    {venue.name}
                  </h3>
                  <div className="space-y-2">
                    {venueSessions.map((session) => (
                      <SessionBlock
                        key={session.id}
                        session={session}
                        isOnAir={isOnAir(session)}
                        isPast={isPast(session)}
                      />
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
}
