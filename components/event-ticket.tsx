"use client";

import { useState, useEffect } from "react";
import { Calendar, Clock, MapPin, Mic2, Timer } from "lucide-react";
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
        // Update every minute (no need for seconds to avoid excessive re-renders unless requested)
        const interval = setInterval(() => {
            setNow(new Date());
        }, 60000);
        return () => clearInterval(interval);
    }, []);

    if (!event.startDate) return null;

    const start = new Date(event.startDate);
    const end = event.endDate ? new Date(event.endDate) : null;

    let countdownText = "";
    let countdownLabel = "";
    let isLive = false;
    let isEnded = false;

    if (end && now > end) {
        isEnded = true;
        countdownLabel = "Event has ended";
    } else if (now >= start) {
        isLive = true;
        countdownLabel = "Event is live!";
    } else {
        const diffMs = start.getTime() - now.getTime();
        const days = Math.floor(diffMs / (1000 * 60 * 60 * 24));
        const hours = Math.floor((diffMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));

        if (days > 0) countdownText = `${days}d ${hours}h ${minutes}m`;
        else if (hours > 0) countdownText = `${hours}h ${minutes}m`;
        else countdownText = `${minutes}m`;
        countdownLabel = "until event starts";
    }

    // Formatting dates
    const formatOptions: Intl.DateTimeFormatOptions = { month: "short", day: "numeric" };
    const getFormattedDate = () => {
        const startStr = new Intl.DateTimeFormat("en-US", formatOptions).format(start);
        if (end && start.getDate() !== end.getDate()) {
            const endStr = new Intl.DateTimeFormat("en-US", formatOptions).format(end);
            return `${startStr} - ${endStr}`;
        }
        return startStr;
    };

    const formattedDate = getFormattedDate();

    const getFormattedTime = () => {
        const timeOptions: Intl.DateTimeFormatOptions = { hour: "numeric", minute: "2-digit" };
        const startStr = new Intl.DateTimeFormat("en-US", timeOptions).format(start);
        if (end) {
            const endStr = new Intl.DateTimeFormat("en-US", timeOptions).format(end);
            return `${startStr} - ${endStr}`;
        }
        return startStr;
    };
    const formattedTime = getFormattedTime();

    // If not mounted yet, render identical shell without the exact time counting to prevent hydration mismatch
    if (!isClient) {
        countdownText = countdownText || "...";
    }

    return (
        <div className={`mt-8 overflow-hidden rounded-2xl border-0 shadow-xl flex flex-col md:flex-row transition-all ${isLive ? "bg-white/90 shadow-navy/5" : "bg-card/70"
            }`}
        >
            {/* Left part: Countdown / Status - Cream styling */}
            <div className={`p-8 md:p-10 flex-col justify-center items-center text-center flex md:w-5/12 ${isLive ? "bg-sand-light/60 text-foreground" : "bg-background/40"
                } border-b md:border-b-0 md:border-r border-dashed border-border/50 relative`}
            >
                {/* Visual dashed line dots (ticket tear-off) */}
                <div className="hidden md:block absolute -top-3 -right-3 w-6 h-6 rounded-full bg-theme-cream/50 shadow-inner z-10" />
                <div className="hidden md:block absolute -bottom-3 -right-3 w-6 h-6 rounded-full bg-theme-cream/50 shadow-inner z-10" />
                <div className="block md:hidden absolute -left-3 -bottom-3 w-6 h-6 rounded-full bg-theme-cream/50 shadow-inner z-10" />
                <div className="block md:hidden absolute -right-3 -bottom-3 w-6 h-6 rounded-full bg-theme-cream/50 shadow-inner z-10" />

                {countdownText ? (
                    <>
                        <Timer className={`h-8 w-8 mx-auto mb-4 ${isLive ? "text-sunset-orange" : "text-sunset-orange"}`} />
                        <p className={`text-4xl md:text-5xl font-bold font-display tracking-tight ${isLive ? "text-foreground" : "text-foreground"}`}>
                            {countdownText}
                        </p>
                        <p className={`text-sm md:text-base mt-2 ${isLive ? "text-muted-foreground" : "text-muted-foreground"}`}>{countdownLabel}</p>
                    </>
                ) : (
                    <>
                        <div className={`h-4 w-4 rounded-full mx-auto mb-4 animate-pulse ${isLive ? "bg-red-500 shadow-[0_0_10px_rgba(239,68,68,0.6)]" : "bg-muted"}`} />
                        <p className={`text-xl font-bold font-display ${isLive ? "text-foreground" : "text-foreground"}`}>
                            {countdownLabel}
                        </p>
                        {isLive && (
                            <Link
                                href={`/live/${event.slug}`}
                                className="mt-6 px-6 py-2.5 text-white font-semibold rounded-full bg-sunset-orange hover:bg-sunset-coral transition-colors text-sm shadow-md flex items-center gap-2"
                            >
                                Watch Live Session
                                <span className="text-lg leading-none">→</span>
                            </Link>
                        )}
                        {isEnded && <p className="text-sm text-muted-foreground mt-2">Thank you for joining!</p>}
                    </>
                )}
            </div>

            {/* Right part: event specifics grid */}
            <div className={`p-8 md:p-10 flex-1 grid grid-cols-2 gap-y-8 gap-x-6 ${isLive ? "bg-sand-light/30" : "bg-card/40"}`}>
                <div>
                    <div className="flex items-center gap-2 mb-2 text-muted-foreground">
                        <Calendar className="h-5 w-5 text-sunset-orange" />
                        <p className="text-sm">Date</p>
                    </div>
                    <p className="font-semibold text-lg text-foreground">{formattedDate}</p>
                </div>

                <div>
                    <div className="flex items-center gap-2 mb-2 text-muted-foreground">
                        <MapPin className="h-5 w-5 text-sand-dark" />
                        <p className="text-sm">Location</p>
                    </div>
                    <p className="font-semibold text-lg text-foreground">
                        {event.location || "TBA"}
                    </p>
                </div>

                <div>
                    <div className="flex items-center gap-2 mb-2 text-muted-foreground">
                        <Clock className="h-5 w-5 text-ocean" />
                        <p className="text-sm">Time</p>
                    </div>
                    <p className="font-semibold text-lg text-foreground">{formattedTime}</p>
                </div>

                <div>
                    <div className="flex items-center gap-2 mb-2 text-muted-foreground">
                        <Mic2 className="h-5 w-5 text-sunset-coral" />
                        <p className="text-sm">Sessions</p>
                    </div>
                    <p className="font-semibold text-lg text-foreground">
                        {event.sessions?.length > 0
                            ? `${event.sessions.length} Sessions`
                            : "TBA"}
                    </p>
                </div>
            </div>
        </div>
    );
}
