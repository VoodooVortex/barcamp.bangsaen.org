"use client";

import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { ChevronDown, Radio } from "lucide-react";

// Island Base Left SVG
function IslandBaseLeft({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 200 60"
      fill="currentColor"
      className={className}
      aria-hidden="true"
      preserveAspectRatio="none"
    > 
      {/* Distant background dune */}
      <path d="M 0 60 L 0 12 C 10 12, 30 12, 45 12 C 60 12, 75 18, 95 18 C 115 18, 130 35, 160 35 C 180 35, 195 45, 200 60 Z" fillOpacity="0.15" />
      {/* Midground dune */}
      <path d="M 0 60 L 0 15 C 15 15, 25 15, 35 15 C 50 15, 55 28, 70 28 C 85 28, 100 22, 125 22 C 150 22, 170 38, 200 60 Z" fillOpacity="0.35" />
      {/* Foreground solid island supporting trees */}
      <path d="M 0 60 L 0 22 C 5 22, 15 22, 25 22 C 35 22, 45 26, 50 26 C 55 26, 65 24, 75 24 C 85 24, 100 30, 120 31 C 140 32, 150 34, 165 35 C 180 36, 190 45, 200 60 Z" />
    </svg>
  );
}

// Island Base Right SVG
function IslandBaseRight({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 200 60"
      fill="currentColor"
      className={className}
      aria-hidden="true"
      preserveAspectRatio="none"
    > 
      {/* Distant background dune */}
      <path d="M 0 60 L 0 8 C 10 8, 30 8, 50 8 C 70 8, 80 12, 100 12 C 120 12, 140 30, 180 30 C 190 30, 195 45, 200 60 Z" fillOpacity="0.15" />
      {/* Midground dune */}
      <path d="M 0 60 L 0 15 C 10 15, 25 15, 35 15 C 45 15, 65 28, 85 28 C 105 28, 120 22, 140 22 C 160 22, 180 35, 200 60 Z" fillOpacity="0.35" />
      {/* Foreground solid island supporting trees */}
      <path d="M 0 60 L 0 18 C 2 18, 10 18, 28 18 C 38 18, 50 25, 60 25 C 70 25, 75 22, 85 22 C 95 22, 120 28, 140 30 C 160 32, 165 34, 175 35 C 185 36, 190 40, 200 60 Z" />
    </svg>
  );
}

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
    <div className="relative h-svh md:h-screen overflow-hidden">
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

      {/* Island Base Left */}
      <div className="absolute bottom-[20%] -left-[10%] md:-left-[5%] lg:-left-[5%] w-[75vw] md:w-[50vw] lg:w-[45vw] h-[12vh] pointer-events-none text-silhouette">
        <IslandBaseLeft className="w-full h-full drop-shadow-md" />
      </div>

      {/* Palm Trees - Silhouettes (animated sway) Left*/}
      <div className="absolute bottom-[23%] md:bottom-[22%] -left-[4%] md:left-[5%] text-silhouette/80 origin-bottom animate-palm-sway">
        <PalmTree className="w-24 h-40 md:w-40 md:h-60" />
      </div>

      <div className="absolute bottom-[24%] md:bottom-[22%] left-[8%] md:left-[15%] text-silhouette/70 origin-bottom animate-palm-sway-slow">
        <PalmTreeSmall className="w-14 h-24 md:w-24 md:h-36" />
      </div>

      {/* Island Base Right */}
      <div className="absolute bottom-[20%] -right-[5%] md:-right-[5%] lg:-right-[5%] w-[75vw] md:w-[50vw] lg:w-[45vw] h-[12vh] pointer-events-none text-silhouette">
        <IslandBaseRight className="w-full h-full scale-x-[-1] drop-shadow-md" />
      </div>

      {/* Palm Trees - Silhouettes (animated sway) Right */}
      <div className="absolute bottom-[25%] md:bottom-[22%] right-[8%] md:right-[20%] text-silhouette/60 origin-bottom animate-palm-sway-slow">
        <PalmTreeSmall className="w-14 h-24 md:w-20 md:h-32" />
      </div>

      <div className="absolute bottom-[24%] md:bottom-[23%] -right-[4%] md:right-[8%] text-silhouette/75 origin-bottom animate-palm-sway">
        <PalmTree className="w-24 h-40 md:w-32 md:h-48" />
      </div>
      {/*<div className="absolute bottom-[22%] right-[8%] text-silhouette/75 pointer-events-none">
        <div className="w-20 md:w-32 h-6 md:h-8 rounded-[50%] bg-current" />
      </div>*/}

      {/* Ocean */}
      <div className="absolute bottom-0 left-0 right-0 h-[25%] bg-ocean-gradient overflow-hidden">
        {/* Wave layers — horizontal drift */}
        <svg
          className="absolute -top-8 left-0 w-[200%] h-16 text-ocean-light opacity-60 animate-wave-drift-slow"
          viewBox="0 0 2880 120"
          preserveAspectRatio="none"
          aria-hidden="true"
        >
          <path
            d="M0,60 C240,120 480,0 720,60 C960,120 1200,0 1440,60 C1680,120 1920,0 2160,60 C2400,120 2640,0 2880,60 L2880,120 L0,120 Z"
            fill="currentColor"
          />
        </svg>
        <svg
          className="absolute -top-4 left-0 w-[200%] h-12 text-ocean opacity-80 animate-wave-drift"
          viewBox="0 0 2880 120"
          preserveAspectRatio="none"
          aria-hidden="true"
        >
          <path
            d="M0,60 C240,0 480,120 720,60 C960,0 1200,120 1440,60 C1680,0 1920,120 2160,60 C2400,0 2640,120 2880,60 L2880,120 L0,120 Z"
            fill="currentColor"
          />
        </svg>
        {/* Shimmer on water */}
        <div className="absolute inset-0 bg-gradient-to-b from-white/10 via-transparent to-transparent animate-pulse-slow" />
      </div>

      {/* Beach/Sand */}
      <div className="absolute bottom-0 left-0 right-0 h-[8%] bg-beach-gradient" />

      {/* Content */}
      <div className="relative z-10 flex flex-col items-center justify-center h-full px-4">
        <div className="text-center max-w-4xl mx-auto">
          {/* Logo */}
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="flex justify-center"
          >
            <Image
              src="/logo-barcamp-bangsaen.png"
              alt="Barcamp Bangsaen"
              width={600}
              height={696}
              priority
              className="w-[180px] sm:w-[220px] md:w-[280px] lg:w-[320px] max-w-[45vw] max-h-[40vh] h-auto object-contain drop-shadow-2xl"
            />
          </motion.div>

          {/* Tagline */}
          <p className="hidden md:block text-base md:text-xl text-white/95 font-medium max-w-2xl mx-auto text-shadow mt-4">
            An unconference by the sea where ideas flow freely.
          </p>

          {/* CTA Buttons */}
          {latestSlug && (
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mt-6 md:mt-8">
              <Button
                size="lg"
                className="bg-sunset-orange hover:bg-sunset-orange/80 text-white border-0 shadow-lg shadow-sunset-orange/30 text-base md:text-lg px-6 md:px-8 py-5 md:py-6"
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

      {/* Scroll indicator */}
      <motion.div
        className="absolute bottom-2 md:bottom-6 inset-x-0 z-10 flex justify-center text-white/60"
        animate={{ y: [0, 8, 0] }}
        transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
      >
        <ChevronDown className="h-8 w-8" />
      </motion.div>

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
