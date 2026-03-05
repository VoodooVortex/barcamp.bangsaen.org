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
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

// Calendar Component
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

    // Add empty cells for days before the first of the month
    const firstDayOfWeek = start.getDay();
    for (let i = 0; i < firstDayOfWeek; i++) {
      days.push(null);
    }

    // Add days of the month
    for (let i = 1; i <= end.getDate(); i++) {
      days.push(i);
    }

    return days;
  };

  const monthNames = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];

  const dayNames = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];

  const handleSelectDate = (day: number) => {
    if (day) {
      onChange(new CalendarDate(focusedDate.year, focusedDate.month, day));
    }
  };

  const isSelected = (day: number) => {
    return (
      value &&
      value.day === day &&
      value.month === focusedDate.month &&
      value.year === focusedDate.year
    );
  };

  const isToday = (day: number) => {
    const today = now(getLocalTimeZone());
    return (
      today.day === day &&
      today.month === focusedDate.month &&
      today.year === focusedDate.year
    );
  };

  const prevMonth = () => {
    setFocusedDate(
      new CalendarDate(
        focusedDate.month === 1 ? focusedDate.year - 1 : focusedDate.year,
        focusedDate.month === 1 ? 12 : focusedDate.month - 1,
        1,
      ),
    );
  };

  const nextMonth = () => {
    setFocusedDate(
      new CalendarDate(
        focusedDate.month === 12 ? focusedDate.year + 1 : focusedDate.year,
        focusedDate.month === 12 ? 1 : focusedDate.month + 1,
        1,
      ),
    );
  };

  const days = daysInMonth(focusedDate);

  return (
    <div className="p-4 bg-background border border-border rounded-lg shadow-sm">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <button
          onClick={prevMonth}
          className="p-1.5 rounded-full hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
        >
          <svg
            className="w-5 h-5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 19l-7-7 7-7"
            />
          </svg>
        </button>
        <span className="text-foreground font-semibold">
          {monthNames[focusedDate.month - 1]} {focusedDate.year}
        </span>
        <button
          onClick={nextMonth}
          className="p-1.5 rounded-full hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
        >
          <svg
            className="w-5 h-5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 5l7 7-7 7"
            />
          </svg>
        </button>
      </div>

      {/* Day names */}
      <div className="grid grid-cols-7 gap-1 mb-2">
        {dayNames.map((day) => (
          <div key={day} className="text-center text-xs text-muted-foreground py-1">
            {day}
          </div>
        ))}
      </div>

      {/* Days */}
      <div className="grid grid-cols-7 gap-1">
        {days.map((day, index) => (
          <button
            key={index}
            onClick={() => day && handleSelectDate(day)}
            disabled={!day}
            className={cn(
              "h-8 w-8 rounded-lg text-sm flex items-center justify-center transition-all",
              !day && "invisible",
              isSelected(day!) &&
              "bg-primary text-primary-foreground font-semibold shadow-sm",
              isToday(day!) &&
              !isSelected(day!) &&
              "border border-primary text-primary",
              !isSelected(day!) &&
              !isToday(day!) &&
              "text-foreground hover:bg-muted",
            )}
          >
            {day}
          </button>
        ))}
      </div>
    </div>
  );
}

// Time Picker Component
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
  const minuteOptions = Array.from({ length: 12 }, (_, i) => i * 5); // 0, 5, 10... 55

  return (
    <div className="p-4 bg-background border border-border rounded-lg shadow-sm w-48">
      <div className="text-foreground font-semibold mb-3 text-center border-b border-border/50 pb-2">
        Time
      </div>

      <div className="flex gap-2">
        {/* Hours */}
        <div className="flex-1 space-y-1 max-h-48 overflow-y-auto scrollbar-thin pr-1">
          {hourOptions.map((hour) => (
            <button
              key={`h-${hour}`}
              onClick={() => onChange(hour * 60 + minutes)}
              className={cn(
                "w-full px-2 py-1.5 rounded text-sm text-center transition-colors",
                hours === hour
                  ? "bg-primary text-primary-foreground font-semibold"
                  : "text-foreground hover:bg-muted",
              )}
            >
              {hour.toString().padStart(2, "0")}
            </button>
          ))}
        </div>

        <div className="w-px bg-border/50 my-2" />

        {/* Minutes */}
        <div className="flex-1 space-y-1 max-h-48 overflow-y-auto scrollbar-thin pl-1">
          {minuteOptions.map((minute) => (
            <button
              key={`m-${minute}`}
              onClick={() => onChange(hours * 60 + minute)}
              className={cn(
                "w-full px-2 py-1.5 rounded text-sm text-center transition-colors",
                minutes === minute
                  ? "bg-primary text-primary-foreground font-semibold"
                  : "text-foreground hover:bg-muted",
              )}
            >
              {minute.toString().padStart(2, "0")}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

// Main DateTimePicker Component
interface DateTimePickerProps {
  date: Date | undefined;
  setDate: (date: Date | undefined) => void;
  placeholder?: string;
  className?: string;
}

export function DateTimePicker({
  date,
  setDate,
  placeholder = "Select date and time",
  className,
}: DateTimePickerProps) {
  const [isOpen, setIsOpen] = React.useState(false);
  const [selectedDate, setSelectedDate] = React.useState<DateValue | null>(
    null,
  );

  React.useEffect(() => {
    if (date) {
      setSelectedDate(
        new CalendarDate(
          date.getFullYear(),
          date.getMonth() + 1,
          date.getDate(),
        ),
      );
    } else {
      setSelectedDate(null);
    }
  }, [date]);

  const handleDateSelect = (newDate: DateValue) => {
    setSelectedDate(newDate);
    // Keep existing time if date changes
    const currentHours = date ? date.getHours() : 0;
    const currentMinutes = date ? date.getMinutes() : 0;
    const newDateTime = new Date(
      newDate.year,
      newDate.month - 1,
      newDate.day,
      currentHours,
      currentMinutes,
    );
    setDate(newDateTime);
  };

  const handleTimeSelect = (minutesFromMidnight: number) => {
    if (selectedDate) {
      const hours = Math.floor(minutesFromMidnight / 60);
      const minutes = minutesFromMidnight % 60;
      const newDate = new Date(
        selectedDate.year,
        selectedDate.month - 1,
        selectedDate.day,
        hours,
        minutes,
      );
      setDate(newDate);
    }
  };

  const getCurrentTimeValue = () => {
    if (date) {
      return date.getHours() * 60 + date.getMinutes();
    }
    return 0;
  };

  const formatDisplay = () => {
    if (date) {
      return date.toLocaleString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        hour12: false,
      });
    }
    return placeholder;
  };

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen} modal={true}>
      <PopoverTrigger asChild>
        <Button
          type="button"
          variant="outline"
          className={cn(
            "w-full justify-start text-left font-normal bg-background text-foreground hover:bg-muted",
            !date && "text-muted-foreground",
            className,
          )}
        >
          <CalendarIcon className="mr-2 h-4 w-4 text-muted-foreground flex-shrink-0" />
          <span
            className={cn(
              "truncate",
              date ? "text-foreground font-medium" : "text-muted-foreground",
            )}
          >
            {formatDisplay()}
          </span>
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0 border-border z-[100] shadow-xl" align="start">
        <div className="flex gap-2 p-3 bg-background rounded-lg">
          <Calendar value={selectedDate} onChange={handleDateSelect} />
          <TimePicker
            value={getCurrentTimeValue()}
            onChange={handleTimeSelect}
          />
        </div>
      </PopoverContent>
    </Popover>
  );
}

// Simple Date Picker (date only)
export function DatePickerSimple({
  date,
  setDate,
  placeholder = "Select date",
  className,
}: DateTimePickerProps) {
  const [isOpen, setIsOpen] = React.useState(false);
  const [selectedDate, setSelectedDate] = React.useState<DateValue | null>(
    null,
  );

  React.useEffect(() => {
    if (date) {
      setSelectedDate(
        new CalendarDate(
          date.getFullYear(),
          date.getMonth() + 1,
          date.getDate(),
        ),
      );
    } else {
      setSelectedDate(null);
    }
  }, [date]);

  const handleSelect = (newDate: DateValue) => {
    setSelectedDate(newDate);
    const newDateObj = new Date(newDate.year, newDate.month - 1, newDate.day);
    setDate(newDateObj);
    setIsOpen(false);
  };

  const formatDisplay = () => {
    if (date) {
      return date.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      });
    }
    return placeholder;
  };

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen} modal={true}>
      <PopoverTrigger asChild>
        <Button
          type="button"
          variant="outline"
          className={cn(
            "w-full justify-start text-left font-normal bg-background text-foreground hover:bg-muted",
            !date && "text-muted-foreground",
            className,
          )}
        >
          <CalendarIcon className="mr-2 h-4 w-4 text-muted-foreground flex-shrink-0" />
          <span
            className={cn(
              "truncate",
              date ? "text-foreground font-medium" : "text-muted-foreground",
            )}
          >
            {formatDisplay()}
          </span>
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0 border-border z-[100] shadow-xl" align="start">
        <div className="p-3 bg-background rounded-lg">
          <Calendar value={selectedDate} onChange={handleSelect} />
        </div>
      </PopoverContent>
    </Popover>
  );
}
