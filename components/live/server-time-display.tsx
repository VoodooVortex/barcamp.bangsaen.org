// Server time display component
// Shows synchronized server time with visual indicator
"use client";

import { useState, useEffect } from "react";
import { Clock } from "lucide-react";

interface ServerTimeDisplayProps {
  initialTime: string;
  timezone?: string;
  className?: string;
}

export function ServerTimeDisplay({
  initialTime,
  timezone = "Asia/Bangkok",
  className = "",
}: ServerTimeDisplayProps) {
  const [displayTime, setDisplayTime] = useState<Date>(new Date(initialTime));
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);

    // Update time every second
    const interval = setInterval(() => {
      setDisplayTime((prev) => new Date(prev.getTime() + 1000));
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  // Sync with server time periodically (every minute)
  useEffect(() => {
    if (!isClient) return;

    const syncInterval = setInterval(async () => {
      try {
        const response = await fetch("/api/time");
        const data = await response.json();
        setDisplayTime(new Date(data.serverNow));
      } catch (error) {
        console.error("Failed to sync time:", error);
      }
    }, 60000);

    return () => clearInterval(syncInterval);
  }, [isClient]);

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: false,
      timeZone: timezone,
    });
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString("en-US", {
      weekday: "short",
      month: "short",
      day: "numeric",
      timeZone: timezone,
    });
  };

  if (!isClient) {
    return (
      <div className={`flex items-center gap-2 text-sm ${className}`}>
        <Clock className="h-4 w-4" />
        <span className="font-mono">--:--:--</span>
      </div>
    );
  }

  return (
    <div className={`flex items-center gap-2.5 ${className}`}>
      <Clock className="h-4 w-4 opacity-75" />
      <div className="flex items-baseline gap-2.5">
        <span className="font-mono text-[0.95rem] md:text-[1.05rem] font-bold tracking-tight">
          {formatTime(displayTime)}
        </span>
        <span className="text-[13px] font-medium opacity-60 mt-0.5">
          {formatDate(displayTime)}
        </span>
      </div>
    </div>
  );
}
