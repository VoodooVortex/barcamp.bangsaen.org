"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Radio } from "lucide-react";

// Palm Tree SVG Component
function PalmTree({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 100 150"
      fill="currentColor"
      className={className}
      aria-hidden="true"
    >
      {/* Trunk */}
      <path d="M48 150 C48 150, 45 120, 46 100 C47 80, 50 60, 52 50 L48 150 Z" />
      {/* Leaves */}
      <path d="M52 50 Q80 30, 95 45 Q80 40, 52 50" />
      <path d="M52 50 Q85 25, 98 35 Q82 32, 52 50" />
      <path d="M52 50 Q75 20, 90 20 Q78 22, 52 50" />
      <path d="M52 50 Q50 15, 60 5 Q55 18, 52 50" />
      <path d="M52 50 Q30 20, 15 25 Q28 25, 52 50" />
      <path d="M52 50 Q20 30, 5 40 Q22 35, 52 50" />
      <path d="M52 50 Q25 45, 10 55 Q26 48, 52 50" />
    </svg>
  );
}

// Small Palm Tree SVG
function PalmTreeSmall({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 80 120"
      fill="currentColor"
      className={className}
      aria-hidden="true"
    >
      <path d="M38 120 C38 120, 36 96, 37 80 C38 64, 40 48, 42 40 L38 120 Z" />
      <path d="M42 40 Q65 24, 78 36 Q65 32, 42 40" />
      <path d="M42 40 Q68 20, 80 28 Q66 26, 42 40" />
      <path d="M42 40 Q60 16, 74 16 Q62 18, 42 40" />
      <path d="M42 40 Q40 12, 50 4 Q45 14, 42 40" />
      <path d="M42 40 Q24 16, 12 20 Q24 20, 42 40" />
      <path d="M42 40 Q16 24, 4 32 Q18 28, 42 40" />
      <path d="M42 40 Q20 36, 8 44 Q22 38, 42 40" />
    </svg>
  );
}

// Wave SVG Component
function Wave({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 1440 120"
      fill="currentColor"
      className={className}
      preserveAspectRatio="none"
      aria-hidden="true"
    >
      <path d="M0,60 C240,120 480,0 720,60 C960,120 1200,0 1440,60 L1440,120 L0,120 Z" />
    </svg>
  );
}

// Sun SVG Component
function Sun({ className }: { className?: string }) {
  return (
    <div
      className={`rounded-full bg-gradient-to-b from-sunset-orange to-sunset-coral ${className}`}
      aria-hidden="true"
    />
  );
}

interface HeroProps {
  latestSlug?: string;
}

export function Hero({ latestSlug }: HeroProps) {
  return (
    <div className="relative min-h-screen overflow-hidden">
      {/* Sky Gradient Background */}
      <div className="absolute inset-0 bg-sky-gradient" />

      {/* Sun */}
      <div className="absolute top-[15%] right-[10%] md:right-[20%]">
        <Sun className="w-24 h-24 md:w-40 md:h-40 opacity-90 animate-pulse-slow" />
      </div>

      {/* Clouds */}
      <div className="absolute top-[20%] left-[10%] w-32 h-12 bg-white/20 rounded-full blur-xl" />
      <div className="absolute top-[25%] right-[30%] w-48 h-16 bg-white/15 rounded-full blur-xl" />
      <div className="absolute top-[30%] left-[40%] w-40 h-14 bg-white/10 rounded-full blur-xl" />

      {/* Palm Trees - Silhouettes */}
      <div className="absolute bottom-[25%] left-[5%] text-silhouette/80">
        <PalmTree className="w-24 h-36 md:w-40 md:h-60" />
      </div>
      <div className="absolute bottom-[22%] left-[15%] text-silhouette/70">
        <PalmTreeSmall className="w-16 h-24 md:w-24 md:h-36" />
      </div>
      <div className="absolute bottom-[20%] right-[20%] text-silhouette/60">
        <PalmTreeSmall className="w-14 h-20 md:w-20 md:h-32" />
      </div>
      <div className="absolute bottom-[23%] right-[8%] text-silhouette/75">
        <PalmTree className="w-20 h-32 md:w-32 md:h-48" />
      </div>

      {/* Island Silhouette */}
      <div className="absolute bottom-[20%] left-1/2 -translate-x-1/2 text-silhouette/50">
        <svg viewBox="0 0 200 60" className="w-48 h-16 md:w-72 md:h-24">
          <ellipse cx="100" cy="50" rx="100" ry="50" />
        </svg>
      </div>

      {/* Ocean */}
      <div className="absolute bottom-0 left-0 right-0 h-[25%] bg-ocean-gradient">
        {/* Wave layers */}
        <div className="absolute -top-8 left-0 right-0 text-ocean-light animate-wave">
          <Wave className="w-full h-16 opacity-60" />
        </div>
        <div
          className="absolute -top-4 left-0 right-0 text-ocean animate-wave"
          style={{ animationDelay: "1s" }}
        >
          <Wave className="w-full h-12 opacity-80" />
        </div>
      </div>

      {/* Beach/Sand */}
      <div className="absolute bottom-0 left-0 right-0 h-[8%] bg-beach-gradient" />

      {/* Content */}
      <div className="relative z-10 flex flex-col items-center justify-center min-h-screen px-4">
        <div className="text-center space-y-8 max-w-4xl mx-auto">
          {/* Title */}
          <div className="space-y-2">
            <h1 className="font-display text-6xl md:text-8xl lg:text-9xl font-bold text-white text-shadow tracking-tight">
              Barcamp
            </h1>
            <div className="flex items-center justify-center gap-4">
              <span className="text-2xl md:text-3xl font-display font-semibold text-white/90 tracking-widest uppercase text-shadow">
                Bangsaen
              </span>
            </div>
          </div>

          {/* Tagline */}
          <p className="text-lg md:text-xl text-white/90 font-medium max-w-2xl mx-auto text-shadow">
            Beach meets technology. An unconference by the sea where ideas flow
            freely.
          </p>

          {/* CTA Buttons */}
          {latestSlug && (
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-8">
              <Button
                size="lg"
                className="bg-sunset-orange hover:bg-sunset-coral text-white border-0 shadow-lg shadow-sunset-orange/30 text-lg px-8 py-6"
                asChild
              >
                <Link href={`/live/${latestSlug}`}>
                  <Radio className="h-5 w-5 mr-2" />
                  View Live Sessions
                </Link>
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Birds */}
      <div className="absolute top-[35%] left-[20%] text-silhouette/40 animate-float">
        <svg viewBox="0 0 40 20" className="w-8 h-4">
          <path
            d="M0 10 Q10 0, 20 10 Q30 0, 40 10"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          />
        </svg>
      </div>
      <div
        className="absolute top-[38%] left-[25%] text-silhouette/30 animate-float"
        style={{ animationDelay: "1s" }}
      >
        <svg viewBox="0 0 30 15" className="w-6 h-3">
          <path
            d="M0 7 Q7 0, 15 7 Q22 0, 30 7"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          />
        </svg>
      </div>
    </div>
  );
}
