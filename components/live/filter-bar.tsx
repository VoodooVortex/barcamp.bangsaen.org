// Filter bar component for live viewer
"use client";

import { Search, MapPin, Tag, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

interface Venue {
  id: string;
  name: string;
}

interface FilterBarProps {
  venues: Venue[];
  selectedVenue: string | null;
  onVenueChange: (venueId: string | null) => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  allTags: string[];
  selectedTags: string[];
  onTagToggle: (tag: string) => void;
  onClearFilters: () => void;
}

export function FilterBar({
  venues,
  selectedVenue,
  onVenueChange,
  searchQuery,
  onSearchChange,
  allTags,
  selectedTags,
  onTagToggle,
  onClearFilters,
}: FilterBarProps) {
  const hasFilters = selectedVenue || searchQuery || selectedTags.length > 0;

  return (
    <div className="space-y-3 p-4 bg-white shadow-sm rounded-lg border border-slate-200">
      {/* Search and Venue row */}
      <div className="flex flex-col sm:flex-row gap-3">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search sessions or speakers..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-9"
          />
          {searchQuery && (
            <button
              onClick={() => onSearchChange("")}
              className="absolute right-3 top-1/2 -translate-y-1/2"
            >
              <X className="h-4 w-4 text-muted-foreground hover:text-foreground" />
            </button>
          )}
        </div>

        {/* Venue filter */}
        <Select
          value={selectedVenue || "all"}
          onValueChange={(value) =>
            onVenueChange(value === "all" ? null : value)
          }
        >
          <SelectTrigger className="w-full sm:w-[200px]">
            <MapPin className="h-4 w-4 mr-2 text-muted-foreground" />
            <SelectValue placeholder="All rooms" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All rooms</SelectItem>
            {venues.map((venue) => (
              <SelectItem key={venue.id} value={venue.id}>
                {venue.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Tags */}
      {allTags.length > 0 && (
        <div className="flex flex-wrap items-center gap-2">
          <Tag className="h-3.5 w-3.5 text-muted-foreground" />
          {allTags.map((tag) => (
            <button
              key={tag}
              onClick={() => onTagToggle(tag)}
              className="focus:outline-none"
            >
              <Badge
                variant={selectedTags.includes(tag) ? "default" : "outline"}
                className={`cursor-pointer text-xs ${selectedTags.includes(tag)
                    ? "bg-ocean hover:bg-ocean-dark text-white border-ocean"
                    : "hover:bg-ocean/10 hover:text-ocean-dark hover:border-ocean/30"
                  }`}
              >
                {tag}
              </Badge>
            </button>
          ))}
        </div>
      )}

      {/* Clear filters */}
      {hasFilters && (
        <div className="flex justify-end">
          <Button
            variant="ghost"
            size="sm"
            onClick={onClearFilters}
            className="text-xs text-ocean-dark hover:text-ocean hover:bg-ocean/10"
          >
            Clear all filters
          </Button>
        </div>
      )}
    </div>
  );
}
