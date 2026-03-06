"use client";

import * as React from "react";
import { Calendar as CalendarIcon } from "lucide-react";
import {
  CalendarDate,
  now,
  getLocalTimeZone,
} from "@internationalized/date";
import type { DateValue } from "@react-aria/datepicker";

import { cn } from "@/lib/utils";
import {
  Popover,
  PopoverAnchor,
  PopoverContent,
} from "@/components/ui/popover";

// ─── Masked Input ───────────────────────────────────────────────────────────

function MaskedInput({
  mask,
  value,
  onValueChange,
  onComplete,
  onBlur,
  onFocus,
  placeholder,
  className,
}: {
  mask: string;
  value: string;
  onValueChange: (raw: string) => void;
  onComplete?: (raw: string) => void;
  onBlur?: () => void;
  onFocus?: () => void;
  placeholder?: string;
  className?: string;
}) {
  const inputRef = React.useRef<HTMLInputElement>(null);
  const [isFocused, setIsFocused] = React.useState(false);

  const slotCount = React.useMemo(() => {
    let count = 0;
    for (let i = 0; i < mask.length; i++) {
      if (mask[i] === "_") count++;
    }
    return count;
  }, [mask]);

  // Build display string from raw digits + mask
  const buildDisplay = React.useCallback(
    (raw: string) => {
      let digitIdx = 0;
      let result = "";
      for (let i = 0; i < mask.length; i++) {
        if (mask[i] === "_") {
          result += digitIdx < raw.length ? raw[digitIdx] : "_";
          digitIdx++;
        } else {
          result += mask[i];
        }
      }
      return result;
    },
    [mask],
  );

  // Show placeholder when empty and not focused, otherwise show mask
  const displayValue = !isFocused && value.length === 0 ? "" : buildDisplay(value);

  // Find next cursor position
  const getSlotPosition = React.useCallback(
    (digitCount: number) => {
      let slots = 0;
      for (let i = 0; i < mask.length; i++) {
        if (mask[i] === "_") {
          if (slots === digitCount) return i;
          slots++;
        }
      }
      return mask.length;
    },
    [mask],
  );

  const setCursor = React.useCallback((pos: number) => {
    requestAnimationFrame(() => {
      inputRef.current?.setSelectionRange(pos, pos);
    });
  }, []);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace") {
      e.preventDefault();
      if (value.length > 0) {
        const newRaw = value.slice(0, -1);
        onValueChange(newRaw);
        setCursor(getSlotPosition(newRaw.length));
      }
      return;
    }

    if (e.key === "Delete") {
      e.preventDefault();
      return;
    }

    // Allow navigation keys
    if (e.key.length > 1) return;

    // Only allow digits
    if (!/^\d$/.test(e.key)) {
      e.preventDefault();
      return;
    }

    e.preventDefault();
    if (value.length >= slotCount) return;

    const newRaw = value + e.key;
    onValueChange(newRaw);
    setCursor(getSlotPosition(newRaw.length));

    if (newRaw.length === slotCount) {
      onComplete?.(newRaw);
    }
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData("text");
    const digits = pasted.replace(/\D/g, "");
    const newRaw = (value + digits).slice(0, slotCount);
    onValueChange(newRaw);
    setCursor(getSlotPosition(newRaw.length));
    if (newRaw.length === slotCount) {
      onComplete?.(newRaw);
    }
  };

  const handleFocus = () => {
    setIsFocused(true);
    onFocus?.();
    // Use timeout so onFocus can update value first
    setTimeout(() => {
      const currentVal = inputRef.current?.value || "";
      const digitCount = currentVal.replace(/\D/g, "").length;
      setCursor(getSlotPosition(digitCount));
    }, 0);
  };

  const handleClick = () => {
    setCursor(getSlotPosition(value.length));
  };

  const handleBlur = () => {
    setIsFocused(false);
    onBlur?.();
  };

  return (
    <input
      ref={inputRef}
      type="text"
      value={displayValue}
      placeholder={placeholder}
      onKeyDown={handleKeyDown}
      onPaste={handlePaste}
      onFocus={handleFocus}
      onClick={handleClick}
      onBlur={handleBlur}
      onChange={() => { }}
      className={className}
      inputMode="numeric"
      autoComplete="off"
    />
  );
}

// ─── Calendar Component ─────────────────────────────────────────────────────

function Calendar({
  value,
  onChange,
}: {
  value: DateValue | null;
  onChange: (date: DateValue) => void;
}) {
  const [focusedDate, setFocusedDate] = React.useState(
    value || now(getLocalTimeZone()),
  );

  const daysInMonth = (date: DateValue) => {
    const start = new Date(date.year, date.month - 1, 1);
    const end = new Date(date.year, date.month, 0);
    const days = [];
    const firstDayOfWeek = start.getDay();
    for (let i = 0; i < firstDayOfWeek; i++) days.push(null);
    for (let i = 1; i <= end.getDate(); i++) days.push(i);
    return days;
  };

  const monthNames = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December",
  ];
  const dayNames = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];

  const handleSelectDate = (day: number) => {
    if (day) onChange(new CalendarDate(focusedDate.year, focusedDate.month, day));
  };

  const isSelected = (day: number) =>
    value && value.day === day && value.month === focusedDate.month && value.year === focusedDate.year;

  const isToday = (day: number) => {
    const today = now(getLocalTimeZone());
    return today.day === day && today.month === focusedDate.month && today.year === focusedDate.year;
  };

  const prevMonth = () => {
    setFocusedDate(new CalendarDate(
      focusedDate.month === 1 ? focusedDate.year - 1 : focusedDate.year,
      focusedDate.month === 1 ? 12 : focusedDate.month - 1, 1,
    ));
  };

  const nextMonth = () => {
    setFocusedDate(new CalendarDate(
      focusedDate.month === 12 ? focusedDate.year + 1 : focusedDate.year,
      focusedDate.month === 12 ? 1 : focusedDate.month + 1, 1,
    ));
  };

  return (
    <div className="p-4 bg-background border border-border rounded-lg shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <button onClick={prevMonth} className="p-1.5 rounded-full hover:bg-muted text-muted-foreground hover:text-foreground transition-colors">
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <span className="text-foreground font-semibold">{monthNames[focusedDate.month - 1]} {focusedDate.year}</span>
        <button onClick={nextMonth} className="p-1.5 rounded-full hover:bg-muted text-muted-foreground hover:text-foreground transition-colors">
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>
      <div className="grid grid-cols-7 gap-1 mb-2">
        {dayNames.map((day) => (
          <div key={day} className="text-center text-xs text-muted-foreground py-1">{day}</div>
        ))}
      </div>
      <div className="grid grid-cols-7 gap-1">
        {daysInMonth(focusedDate).map((day, index) => (
          <button
            key={index}
            onClick={() => day && handleSelectDate(day)}
            disabled={!day}
            className={cn(
              "h-8 w-8 rounded-lg text-sm flex items-center justify-center transition-all",
              !day && "invisible",
              isSelected(day!) && "bg-primary text-primary-foreground font-semibold shadow-sm",
              isToday(day!) && !isSelected(day!) && "border border-primary text-primary",
              !isSelected(day!) && !isToday(day!) && "text-foreground hover:bg-muted",
            )}
          >{day}</button>
        ))}
      </div>
    </div>
  );
}

// ─── Time Picker Component ──────────────────────────────────────────────────

function TimePicker({
  value,
  onChange,
}: {
  value: number;
  onChange: (value: number) => void;
}) {
  const hours = Math.floor(value / 60);
  const minutes = value % 60;
  const hourOptions = Array.from({ length: 24 }, (_, i) => i);
  const minuteOptions = Array.from({ length: 12 }, (_, i) => i * 5);

  return (
    <div className="p-4 bg-background border border-border rounded-lg shadow-sm w-48">
      <div className="text-foreground font-semibold mb-3 text-center border-b border-border/50 pb-2">Time</div>
      <div className="flex gap-2">
        <div className="flex-1 space-y-1 max-h-48 overflow-y-auto scrollbar-thin pr-1">
          {hourOptions.map((hour) => (
            <button key={`h-${hour}`} onClick={() => onChange(hour * 60 + minutes)}
              className={cn("w-full px-2 py-1.5 rounded text-sm text-center transition-colors",
                hours === hour ? "bg-primary text-primary-foreground font-semibold" : "text-foreground hover:bg-muted",
              )}>{hour.toString().padStart(2, "0")}</button>
          ))}
        </div>
        <div className="w-px bg-border/50 my-2" />
        <div className="flex-1 space-y-1 max-h-48 overflow-y-auto scrollbar-thin pl-1">
          {minuteOptions.map((minute) => (
            <button key={`m-${minute}`} onClick={() => onChange(hours * 60 + minute)}
              className={cn("w-full px-2 py-1.5 rounded text-sm text-center transition-colors",
                minutes === minute ? "bg-primary text-primary-foreground font-semibold" : "text-foreground hover:bg-muted",
              )}>{minute.toString().padStart(2, "0")}</button>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── Helpers ────────────────────────────────────────────────────────────────

function dateToRawDateTime(d: Date): string {
  return [
    d.getDate().toString().padStart(2, "0"),
    (d.getMonth() + 1).toString().padStart(2, "0"),
    d.getFullYear().toString(),
    d.getHours().toString().padStart(2, "0"),
    d.getMinutes().toString().padStart(2, "0"),
  ].join("");
}

function dateToRawDate(d: Date): string {
  return [
    d.getDate().toString().padStart(2, "0"),
    (d.getMonth() + 1).toString().padStart(2, "0"),
    d.getFullYear().toString(),
  ].join("");
}

function rawDateTimeToDate(raw: string): Date | null {
  if (raw.length !== 12) return null;
  const day = parseInt(raw.slice(0, 2), 10);
  const month = parseInt(raw.slice(2, 4), 10);
  const year = parseInt(raw.slice(4, 8), 10);
  const hours = parseInt(raw.slice(8, 10), 10);
  const minutes = parseInt(raw.slice(10, 12), 10);
  if (month < 1 || month > 12 || day < 1 || day > 31 || hours > 23 || minutes > 59) return null;
  if (year < 1900 || year > 2100) return null;
  const d = new Date(year, month - 1, day, hours, minutes);
  if (d.getDate() !== day || d.getMonth() !== month - 1) return null;
  return d;
}

function rawDateToDate(raw: string): Date | null {
  if (raw.length !== 8) return null;
  const day = parseInt(raw.slice(0, 2), 10);
  const month = parseInt(raw.slice(2, 4), 10);
  const year = parseInt(raw.slice(4, 8), 10);
  if (month < 1 || month > 12 || day < 1 || day > 31) return null;
  if (year < 1900 || year > 2100) return null;
  const d = new Date(year, month - 1, day);
  if (d.getDate() !== day || d.getMonth() !== month - 1) return null;
  return d;
}

const DATETIME_MASK = "__/__/____ __:__";
const DATE_MASK = "__/__/____";

// ─── Main DateTimePicker Component ──────────────────────────────────────────

interface DateTimePickerProps {
  date: Date | undefined;
  setDate: (date: Date | undefined) => void;
  placeholder?: string;
  className?: string;
}

export function DateTimePicker({
  date,
  setDate,
  placeholder = "DD/MM/YYYY HH:mm",
  className,
}: DateTimePickerProps) {
  const [isOpen, setIsOpen] = React.useState(false);
  const [selectedDate, setSelectedDate] = React.useState<DateValue | null>(null);
  const [rawDigits, setRawDigits] = React.useState("");
  const isTypingRef = React.useRef(false);

  // Sync from date prop ONLY when not actively typing
  React.useEffect(() => {
    if (isTypingRef.current) return;
    if (date) {
      setSelectedDate(new CalendarDate(date.getFullYear(), date.getMonth() + 1, date.getDate()));
      setRawDigits(dateToRawDateTime(date));
    } else {
      setSelectedDate(null);
      setRawDigits("");
    }
  }, [date]);

  const handleFocus = () => {
    // Pre-fill with current date/time when empty
    if (!date && rawDigits.length === 0) {
      const now = new Date();
      const raw = dateToRawDateTime(now);
      isTypingRef.current = false;
      setDate(now);
      setRawDigits(raw);
      setSelectedDate(new CalendarDate(now.getFullYear(), now.getMonth() + 1, now.getDate()));
    }
  };

  const handleRawChange = (raw: string) => {
    isTypingRef.current = true;
    setRawDigits(raw);
  };

  const handleComplete = (raw: string) => {
    const parsed = rawDateTimeToDate(raw);
    if (parsed) {
      isTypingRef.current = false;
      setDate(parsed);
    }
  };

  const handleBlur = () => {
    isTypingRef.current = false;
    if (rawDigits.length === 12) {
      const parsed = rawDateTimeToDate(rawDigits);
      if (parsed) {
        setDate(parsed);
      } else if (date) {
        setRawDigits(dateToRawDateTime(date));
      }
    } else if (rawDigits.length === 0) {
      // Keep empty
    } else if (date) {
      setRawDigits(dateToRawDateTime(date));
    }
  };

  const handleDateSelect = (newDate: DateValue) => {
    setSelectedDate(newDate);
    const h = date ? date.getHours() : 0;
    const m = date ? date.getMinutes() : 0;
    const dt = new Date(newDate.year, newDate.month - 1, newDate.day, h, m);
    isTypingRef.current = false;
    setDate(dt);
    setRawDigits(dateToRawDateTime(dt));
  };

  const handleTimeSelect = (minutesFromMidnight: number) => {
    if (selectedDate) {
      const h = Math.floor(minutesFromMidnight / 60);
      const m = minutesFromMidnight % 60;
      const dt = new Date(selectedDate.year, selectedDate.month - 1, selectedDate.day, h, m);
      isTypingRef.current = false;
      setDate(dt);
      setRawDigits(dateToRawDateTime(dt));
    }
  };

  const getCurrentTimeValue = () => (date ? date.getHours() * 60 + date.getMinutes() : 0);

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen} modal={true}>
      <PopoverAnchor asChild>
        <div className={cn("relative flex items-center", className)}>
          <MaskedInput
            mask={DATETIME_MASK}
            value={rawDigits}
            onValueChange={handleRawChange}
            onComplete={handleComplete}
            onBlur={handleBlur}
            onFocus={handleFocus}
            placeholder={placeholder}
            className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 pr-10 text-base shadow-sm transition-colors text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring md:text-sm"
          />
          <button
            type="button"
            onClick={() => setIsOpen((v) => !v)}
            className="absolute right-2 text-muted-foreground hover:text-foreground transition-colors"
          >
            <CalendarIcon className="h-4 w-4" />
          </button>
        </div>
      </PopoverAnchor>
      <PopoverContent className="w-auto p-0 border-border z-[100] shadow-xl" align="start">
        <div className="flex gap-2 p-3 bg-background rounded-lg">
          <Calendar value={selectedDate} onChange={handleDateSelect} />
          <TimePicker value={getCurrentTimeValue()} onChange={handleTimeSelect} />
        </div>
      </PopoverContent>
    </Popover>
  );
}

// ─── Simple Date Picker (date only) ─────────────────────────────────────────

export function DatePickerSimple({
  date,
  setDate,
  placeholder = "DD/MM/YYYY",
  className,
}: DateTimePickerProps) {
  const [isOpen, setIsOpen] = React.useState(false);
  const [selectedDate, setSelectedDate] = React.useState<DateValue | null>(null);
  const [rawDigits, setRawDigits] = React.useState("");
  const isTypingRef = React.useRef(false);

  React.useEffect(() => {
    if (isTypingRef.current) return;
    if (date) {
      setSelectedDate(new CalendarDate(date.getFullYear(), date.getMonth() + 1, date.getDate()));
      setRawDigits(dateToRawDate(date));
    } else {
      setSelectedDate(null);
      setRawDigits("");
    }
  }, [date]);

  const handleRawChange = (raw: string) => {
    isTypingRef.current = true;
    setRawDigits(raw);
  };

  const handleFocus = () => {
    if (!date && rawDigits.length === 0) {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const raw = dateToRawDate(today);
      isTypingRef.current = false;
      setDate(today);
      setRawDigits(raw);
      setSelectedDate(new CalendarDate(today.getFullYear(), today.getMonth() + 1, today.getDate()));
    }
  };

  const handleComplete = (raw: string) => {
    const parsed = rawDateToDate(raw);
    if (parsed) {
      isTypingRef.current = false;
      setDate(parsed);
    }
  };

  const handleBlur = () => {
    isTypingRef.current = false;
    if (rawDigits.length === 8) {
      const parsed = rawDateToDate(rawDigits);
      if (parsed) {
        setDate(parsed);
      } else if (date) {
        setRawDigits(dateToRawDate(date));
      }
    } else if (rawDigits.length === 0) {
      // Keep empty
    } else if (date) {
      setRawDigits(dateToRawDate(date));
    }
  };

  const handleSelect = (newDate: DateValue) => {
    setSelectedDate(newDate);
    const dt = new Date(newDate.year, newDate.month - 1, newDate.day);
    isTypingRef.current = false;
    setDate(dt);
    setRawDigits(dateToRawDate(dt));
    setIsOpen(false);
  };

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen} modal={true}>
      <PopoverAnchor asChild>
        <div className={cn("relative flex items-center", className)}>
          <MaskedInput
            mask={DATE_MASK}
            value={rawDigits}
            onValueChange={handleRawChange}
            onComplete={handleComplete}
            onBlur={handleBlur}
            onFocus={handleFocus}
            placeholder={placeholder}
            className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 pr-10 text-base shadow-sm transition-colors text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring md:text-sm"
          />
          <button
            type="button"
            onClick={() => setIsOpen((v) => !v)}
            className="absolute right-2 text-muted-foreground hover:text-foreground transition-colors"
          >
            <CalendarIcon className="h-4 w-4" />
          </button>
        </div>
      </PopoverAnchor>
      <PopoverContent className="w-auto p-0 border-border z-[100] shadow-xl" align="start">
        <div className="p-3 bg-background rounded-lg">
          <Calendar value={selectedDate} onChange={handleSelect} />
        </div>
      </PopoverContent>
    </Popover>
  );
}
