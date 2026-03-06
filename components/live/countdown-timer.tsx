// Countdown timer component
// Displays time remaining until session starts with live updates
"use client";

import { useState, useEffect } from "react";

interface CountdownTimerProps {
  targetTime: string;
  className?: string;
}

interface TimeRemaining {
  hours: number;
  minutes: number;
  seconds: number;
  total: number;
}

function calculateTimeRemaining(targetTime: string): TimeRemaining {
  const now = new Date().getTime();
  const target = new Date(targetTime).getTime();
  const total = target - now;

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

export function CountdownTimer({
  targetTime,
  className = "",
}: CountdownTimerProps) {
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
    setTimeRemaining(calculateTimeRemaining(targetTime));

    // Update every second
    const interval = setInterval(() => {
      const remaining = calculateTimeRemaining(targetTime);
      setTimeRemaining(remaining);

      // Stop interval when countdown reaches zero
      if (remaining.total <= 0) {
        clearInterval(interval);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [targetTime]);

  // Get color based on urgency
  const getUrgencyColor = () => {
    const totalMinutes = timeRemaining.hours * 60 + timeRemaining.minutes;
    if (totalMinutes < 5) {
      return "bg-sunset-orange/20 text-sunset-orange border-sunset-orange/30";
    }
    if (totalMinutes < 30) {
      return "bg-sunset-coral/20 text-sunset-coral border-sunset-coral/30";
    }
    return "bg-sand/10 text-sand-dark border-sand/20";
  };

  // Format display based on remaining time
  const formatDisplay = () => {
    if (timeRemaining.total <= 0) {
      return "Starting now";
    }

    const parts: string[] = [];

    if (timeRemaining.hours > 0) {
      parts.push(`${timeRemaining.hours}h`);
    }

    parts.push(`${formatTimeUnit(timeRemaining.minutes)}m`);
    parts.push(`${formatTimeUnit(timeRemaining.seconds)}s`);

    return parts.join(" ");
  };

  if (!isMounted) {
    return (
      <div
        className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold border whitespace-nowrap opacity-0 ${className}`}
      >
        <span>00h 00m 00s</span>
      </div>
    );
  }

  return (
    <div
      className={`
        inline-flex items-center gap-1 px-2.5 py-1 rounded-full
        text-xs font-semibold border whitespace-nowrap
        transition-colors duration-300 min-[1920px]:text-sm
        ${getUrgencyColor()}
        ${className}
      `}
    >
      {timeRemaining.total > 0 && (
        <span className="relative flex h-1.5 w-1.5">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-current opacity-75" />
          <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-current" />
        </span>
      )}
      <span>{formatDisplay()}</span>
    </div>
  );
}
