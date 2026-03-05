// Main live viewer component
// Combines all live viewer sections with real-time updates
"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  WifiOff,
  RefreshCw,
  Calendar,
  Radio,
  MapPin,
  Mic2,
  Timer,
} from "lucide-react";
import { useSocket } from "@/lib/socket/client";
import { ServerTimeDisplay } from "./server-time-display";
import { OnAirCard } from "./on-air-card";
import { UpNextCard } from "./up-next-card";
import { ScheduleGrid } from "./schedule-grid";
import { FilterBar } from "./filter-bar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface EventYear {
  id: string;
  slug: string;
  name: string;
  location?: string | null;
  timezone: string;
  startDate: string | null;
  endDate: string | null;
}

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
  venue: Venue;
}

interface LiveStatus {
  serverTime: string;
  timezone: string;
  onAir: Array<{
    id: string;
    title: string;
    speakerName: string;
    startAt: string;
    endAt: string;
    tags: string[];
    livestreamUrl?: string;
    venue: Venue;
    progress: number;
  }>;
  upNext: Array<{
    id: string;
    title: string;
    speakerName: string;
    startAt: string;
    endAt: string;
    tags: string[];
    venue: Venue;
    startsIn: string;
  }>;
}

interface ScheduleData {
  eventYear: EventYear;
  venues: Venue[];
  sessions: Session[];
}

interface LiveViewerProps {
  slug: string;
  initialData: ScheduleData;
  initialStatus: LiveStatus;
}

export function LiveViewer({
  slug,
  initialData,
  initialStatus,
}: LiveViewerProps) {
  const [schedule, setSchedule] = useState<ScheduleData>(initialData);
  const [status, setStatus] = useState<LiveStatus>(initialStatus);
  const [isConnected, setIsConnected] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Filters
  const [selectedVenue, setSelectedVenue] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTags, setSelectedTags] = useState<string[]>([]);

  // Get all unique tags
  const allTags = useMemo(() => {
    const tags = new Set<string>();
    schedule.sessions.forEach((s) => s.tags.forEach((t) => tags.add(t)));
    return Array.from(tags).sort();
  }, [schedule.sessions]);

  // Event countdown state
  const [countdownText, setCountdownText] = useState("");
  const eventStartDate = useMemo(() => schedule.eventYear.startDate ? new Date(schedule.eventYear.startDate) : null, [schedule.eventYear.startDate]);
  const eventEndDate = useMemo(() => schedule.eventYear.endDate ? new Date(schedule.eventYear.endDate) : null, [schedule.eventYear.endDate]);

  const eventStatus = useMemo(() => {
    if (!eventStartDate) return "unknown";
    const now = new Date();
    if (eventEndDate && now > eventEndDate) return "ended";
    if (now >= eventStartDate) return "live";
    return "upcoming";
  }, [eventStartDate, eventEndDate]);

  useEffect(() => {
    if (eventStatus !== "upcoming" || !eventStartDate) return;

    const update = () => {
      const now = new Date();
      const diffMs = eventStartDate.getTime() - now.getTime();
      if (diffMs <= 0) { setCountdownText("Starting now!"); return; }
      const days = Math.floor(diffMs / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diffMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diffMs % (1000 * 60)) / 1000);
      if (days > 0) setCountdownText(`${days}d ${hours}h ${minutes}m`);
      else if (hours > 0) setCountdownText(`${hours}h ${minutes}m ${seconds}s`);
      else setCountdownText(`${minutes}m ${seconds}s`);
    };
    update();
    const interval = setInterval(update, 1000);
    return () => clearInterval(interval);
  }, [eventStatus, eventStartDate]);

  // Fetch schedule data
  const fetchSchedule = useCallback(async () => {
    try {
      setIsRefreshing(true);
      const response = await fetch(`/api/public/${slug}/schedule`);
      if (response.ok) {
        const data = await response.json();
        setSchedule(data);
        setLastUpdated(new Date());
      }
    } catch (error) {
      console.error("Failed to fetch schedule:", error);
    } finally {
      setIsRefreshing(false);
    }
  }, [slug]);

  // Fetch status data
  const fetchStatus = useCallback(async () => {
    try {
      const response = await fetch(`/api/public/${slug}/status`);
      if (response.ok) {
        const data = await response.json();
        setStatus(data);
      }
    } catch (error) {
      console.error("Failed to fetch status:", error);
    }
  }, [slug]);

  // Socket.io connection
  useSocket({
    slug,
    onScheduleUpdate: () => {
      fetchSchedule();
      fetchStatus();
    },
    onConnect: () => setIsConnected(true),
    onDisconnect: () => setIsConnected(false),
  });

  // Periodic refresh (every 60 seconds)
  useEffect(() => {
    const interval = setInterval(() => {
      fetchStatus();
    }, 15000);

    return () => clearInterval(interval);
  }, [fetchStatus]);

  // Tag toggle handler
  const handleTagToggle = (tag: string) => {
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag],
    );
  };

  // Clear all filters
  const handleClearFilters = () => {
    setSelectedVenue(null);
    setSearchQuery("");
    setSelectedTags([]);
  };

  const currentTime = new Date(status.serverTime);

  return (
    <div className="space-y-6">
      {/* Header - Light theme */}
      <div className="relative overflow-hidden rounded-2xl bg-white border border-slate-200 shadow-sm">
        {/* Background decoration */}
        <div className="absolute inset-0 bg-gradient-to-br from-[#D4A373]/5 via-transparent to-[#1B222C]/5" />

        <div className="relative p-4 sm:px-6 sm:py-5">
          {/* Top row: Event title and Live indicator */}
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            {/* Left: Event info */}
            <div className="space-y-2">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#1E293B]/5 border border-[#1E293B]/10">
                  <Radio className="h-5 w-5 text-[#D4A373]" />
                </div>
                <div>
                  <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold font-display text-[#1E293B] tracking-tight">
                    {schedule.eventYear.name}
                  </h1>
                  <p className="hidden sm:block text-xs lg:text-sm text-slate-500 font-medium">
                    Live Session Schedule
                  </p>
                </div>
              </div>

              {/* Event metadata */}
              <div className="flex flex-wrap items-center gap-2 sm:gap-3 text-xs">
                <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-50 border border-slate-200">
                  <Calendar className="h-3.5 w-3.5 text-[#D4A373]" />
                  <span className="text-slate-700 font-medium">{slug}</span>
                </div>
                {schedule.eventYear.location && (
                  <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-50 border border-slate-200">
                    <MapPin className="h-3.5 w-3.5 text-[#14B8A6]" />
                    <span className="text-slate-600">{schedule.eventYear.location}</span>
                  </div>
                )}
                <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-50 border border-slate-200">
                  <span className="text-slate-600">
                    {schedule.venues.length} Venues
                  </span>
                </div>
                <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-50 border border-slate-200">
                  <Mic2 className="h-3.5 w-3.5 text-[#D4A373]" />
                  <span className="text-slate-600">
                    {schedule.sessions.length} Sessions
                  </span>
                </div>
              </div>
            </div>

            {/* Right: Time and Connection status */}
            <div className="flex flex-row flex-wrap lg:flex-col items-center lg:items-end gap-3 mt-3 lg:mt-0">
              {/* Server time display */}
              <div className="bg-white rounded-xl px-4 py-1.5 border border-slate-200 shadow-sm text-slate-800 flex items-center min-h-[42px]">
                <ServerTimeDisplay
                  initialTime={status.serverTime}
                  timezone="Asia/Bangkok"
                />
              </div>

              {/* Connection status and refresh */}
              <div className="flex items-center gap-2">
                {isConnected ? (
                  <Badge
                    variant="outline"
                    className="bg-emerald-50 text-emerald-600 border-emerald-200 px-2 lg:px-3 py-1 h-[38px] flex items-center"
                  >
                    <span className="relative flex h-2 w-2 mr-1.5 lg:mr-2">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                    </span>
                    <span className="hidden sm:inline">Live Updates</span>
                    <span className="sm:hidden">Live</span>
                  </Badge>
                ) : (
                  <Badge
                    variant="outline"
                    className="bg-amber-50 text-amber-600 border-amber-200 px-2 lg:px-3 py-1 h-[38px] flex items-center"
                  >
                    <WifiOff className="h-3 w-3 mr-1.5" />
                    <span className="hidden sm:inline">Reconnecting...</span>
                    <span className="sm:hidden">Offline</span>
                  </Badge>
                )}

                <Button
                  variant="outline"
                  size="sm"
                  onClick={fetchSchedule}
                  disabled={isRefreshing}
                  className="border-slate-200 bg-white text-slate-700 hover:text-slate-700 hover:bg-slate-50 h-[38px]"
                >
                  <RefreshCw
                    className={`h-4 w-4 ${isRefreshing ? "animate-spin" : ""}`}
                  />
                  <span className="hidden lg:inline">Refresh</span>
                </Button>
              </div>
            </div>
          </div>

          {/* Last updated */}
          <div className="mt-3 pt-3 border-t border-slate-100">
            <p className="text-[10px] sm:text-xs text-slate-400">
              Last updated:{" "}
              <span suppressHydrationWarning>
                {lastUpdated.toLocaleTimeString("en-US", {
                  timeZone: "Asia/Bangkok",
                  hour: "2-digit",
                  minute: "2-digit",
                  second: "2-digit",
                  hour12: false,
                })}
              </span>
            </p>
          </div>
        </div>
      </div>

      {/* Main content tabs */}
      <Tabs defaultValue="live" className="space-y-4">
        <TabsList className="grid w-full grid-cols-2 lg:w-auto lg:inline-flex bg-white border border-slate-200 shadow-sm rounded-lg p-1">
          <TabsTrigger
            value="live"
            className="data-[state=active]:bg-[#1E293B] data-[state=active]:text-white text-slate-600 rounded-md"
          >
            Live Now
          </TabsTrigger>
          <TabsTrigger
            value="schedule"
            className="data-[state=active]:bg-[#1E293B] data-[state=active]:text-white text-slate-600 rounded-md"
          >
            Full Schedule
          </TabsTrigger>
        </TabsList>

        <TabsContent value="live" className="space-y-6">
          {/* On Air section */}
          <section>
            <h2 className="text-base sm:text-lg font-bold mb-3 flex items-center gap-2 font-display text-[#1E293B]">
              <span className="relative flex h-2.5 w-2.5 sm:h-3 sm:w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 sm:h-3 sm:w-3 bg-red-500"></span>
              </span>
              On Air Now
            </h2>

            <AnimatePresence mode="popLayout">
              {status.onAir.length > 0 ? (
                <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 min-[1920px]:grid-cols-4">
                  {status.onAir.map((session) => (
                    <OnAirCard key={session.id} session={session} />
                  ))}
                </div>
              ) : eventStatus === "upcoming" && eventStartDate ? (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-center py-12 bg-gradient-to-br from-[#FEFAE0]/80 to-white rounded-xl border border-[#D4A373]/20"
                >
                  <Timer className="h-8 w-8 text-[#D4A373] mx-auto mb-3" />
                  <p className="text-sm text-slate-500 mb-1">Event starts in</p>
                  <p className="text-4xl font-bold text-[#1E293B] tracking-tight" suppressHydrationWarning>
                    {countdownText}
                  </p>
                  <p className="text-sm text-slate-500 mt-2">
                    {eventStartDate.toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric", year: "numeric" })}
                  </p>
                </motion.div>
              ) : eventStatus === "ended" ? (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-center py-8 bg-muted/50 rounded-lg"
                >
                  <p className="text-lg font-semibold text-muted-foreground">🏁 Event has ended</p>
                  <p className="text-sm text-muted-foreground">Thank you for joining!</p>
                </motion.div>
              ) : (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-center py-8 bg-muted/50 rounded-lg"
                >
                  <p className="text-muted-foreground">
                    No sessions currently on air
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Check the schedule for upcoming sessions
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
          </section>

          {/* Up Next section */}
          <section>
            <h2 className="text-base sm:text-lg font-bold mb-3 font-display text-[#1E293B]">
              Up Next
            </h2>

            <AnimatePresence mode="popLayout">
              {status.upNext.length > 0 ? (
                <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 min-[1920px]:grid-cols-5">
                  {status.upNext.map((session) => (
                    <UpNextCard
                      key={session.id}
                      session={session}
                    />
                  ))}
                </div>
              ) : (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-center py-8 bg-muted/50 rounded-lg"
                >
                  <p className="text-muted-foreground">No upcoming sessions</p>
                </motion.div>
              )}
            </AnimatePresence>
          </section>
        </TabsContent>

        <TabsContent value="schedule" className="space-y-4">
          {/* Filters */}
          <FilterBar
            venues={schedule.venues}
            selectedVenue={selectedVenue}
            onVenueChange={setSelectedVenue}
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            allTags={allTags}
            selectedTags={selectedTags}
            onTagToggle={handleTagToggle}
            onClearFilters={handleClearFilters}
          />

          {/* Schedule grid */}
          <ScheduleGrid
            venues={schedule.venues}
            sessions={schedule.sessions}
            currentTime={currentTime}
            selectedVenue={selectedVenue || undefined}
            searchQuery={searchQuery}
            selectedTags={selectedTags}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}
