// Session block component for schedule grid
// Displays a single session in the timeline
"use client";

import { motion } from "framer-motion";
import { User, Clock } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface Session {
  id: string;
  title: string;
  speakerName: string;
  startAt: string;
  endAt: string;
  tags: string[];
  description?: string | null;
}

interface SessionBlockProps {
  session: Session;
  isOnAir?: boolean;
  isPast?: boolean;
  onClick?: () => void;
}

export function SessionBlock({ session, isOnAir, isPast, onClick }: SessionBlockProps) {
  const formatTime = (dateStr: string) => {
    return new Date(dateStr).toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    });
  };


  const duration =
    (new Date(session.endAt).getTime() - new Date(session.startAt).getTime()) /
    (1000 * 60); // minutes

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <motion.div
            layout
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            whileHover={{ scale: 1.02 }}
            onClick={onClick}
            className={`
              relative p-3 rounded-lg cursor-pointer transition-all shadow-sm
              ${isPast
                ? "border border-slate-200 dark:border-border bg-slate-50 dark:bg-muted/50 dark:bg-muted/20 opacity-75 grayscale-[0.2]"
                : "bg-white dark:bg-card border border-slate-200 dark:border-border hover:border-slate-300 hover:shadow-md"
              }
            `}
          >
            <div className="space-y-2">
              {/* Time */}
              <div className="flex items-center gap-1 text-xs font-semibold text-slate-500 dark:text-slate-400">
                <Clock className="h-3 w-3" />
                <span>
                  {formatTime(session.startAt)} - {formatTime(session.endAt)}
                </span>
                <span className="text-slate-400 dark:text-slate-500">({duration}m)</span>
              </div>

              {/* Title & Status Badge */}
              <div className="flex items-start gap-2">
                <h4 className={`font-bold text-sm leading-tight line-clamp-2 ${isPast ? "text-slate-500 line-through decoration-slate-300" : "text-[#1E293B] dark:text-foreground"}`}>
                  {session.title}
                </h4>
                {isOnAir && (
                  <Badge variant="default" className="text-[9px] px-1.5 py-0 h-4 bg-red-500 hover:bg-red-600 text-white shrink-0 animate-pulse">
                    LIVE
                  </Badge>
                )}
                {isPast && (
                  <Badge variant="secondary" className="text-[9px] px-1.5 py-0 h-4 bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300 shrink-0">
                    Ended
                  </Badge>
                )}
              </div>

              {/* Speaker */}
              <div className="flex items-center gap-1 text-xs font-medium text-slate-600 dark:text-slate-300">
                <User className="h-3 w-3 text-slate-400 dark:text-slate-500" />
                <span className="truncate">{session.speakerName}</span>
              </div>

              {/* Tags */}
              <div className="flex flex-wrap gap-1">
                {session.tags.slice(0, 2).map((tag) => (
                  <Badge
                    key={tag}
                    variant="outline"
                    className="text-[10px] px-1 py-0 bg-slate-50 dark:bg-muted text-slate-600 dark:text-slate-300 border-slate-200 dark:border-border"
                  >
                    {tag}
                  </Badge>
                ))}
                {session.tags.length > 2 && (
                  <Badge variant="outline" className="text-[10px] px-1 py-0 bg-slate-50 dark:bg-muted text-slate-600 dark:text-slate-300 border-slate-200 dark:border-border">
                    +{session.tags.length - 2}
                  </Badge>
                )}
              </div>
            </div>
          </motion.div>
        </TooltipTrigger>
        <TooltipContent side="top" className="max-w-xs">
          <div className="space-y-1">
            <p className="font-semibold">{session.title}</p>
            <p className="text-xs text-muted-foreground">
              {formatTime(session.startAt)} - {formatTime(session.endAt)}
            </p>
            {session.description && (
              <p className="text-xs">{session.description}</p>
            )}
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider >
  );
}
