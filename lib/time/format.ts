export interface TimeRemaining {
  hours: number;
  minutes: number;
  seconds: number;
  total: number;
}

export function formatTime(dateStr: string | Date): string {
  const date = typeof dateStr === "string" ? new Date(dateStr) : dateStr;
  return date.toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
}

export function formatTimeUnit(value: number): string {
  return value.toString().padStart(2, "0");
}

export function calculateTimeRemaining(targetTime: string | Date): TimeRemaining {
  const now = Date.now();
  const target =
    typeof targetTime === "string" ? new Date(targetTime).getTime() : targetTime.getTime();
  const total = target - now;

  if (total <= 0) {
    return { hours: 0, minutes: 0, seconds: 0, total: 0 };
  }

  const hours = Math.floor(total / (1000 * 60 * 60));
  const minutes = Math.floor((total % (1000 * 60 * 60)) / (1000 * 60));
  const seconds = Math.floor((total % (1000 * 60)) / 1000);

  return { hours, minutes, seconds, total };
}

export function getDateKey(timeStr: string | Date): string {
  const d = typeof timeStr === "string" ? new Date(timeStr) : timeStr;
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

export function formatDateHeader(timeStr: string | Date): string {
  const date = typeof timeStr === "string" ? new Date(timeStr) : timeStr;
  return date.toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
  });
}
