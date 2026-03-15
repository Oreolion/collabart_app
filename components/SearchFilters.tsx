"use client";
import React from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";

const GENRES = [
  "Pop", "Rock", "Hip Hop", "R&B", "Electronic", "Jazz", "Classical",
  "Country", "Folk", "Reggae", "Blues", "Metal", "Punk", "Latin",
  "Afrobeats", "Gospel", "Soul", "Funk", "Indie", "Alternative",
];

const MOODS = [
  "Happy", "Sad", "Energetic", "Chill", "Dark", "Uplifting", "Romantic",
  "Aggressive", "Dreamy", "Nostalgic", "Intense", "Peaceful",
];

const TALENTS = [
  "Vocalist", "Guitarist", "Bassist", "Drummer", "Pianist", "Producer",
  "Mix Engineer", "Mastering Engineer", "Songwriter", "Rapper",
  "DJ", "Graphic Design", "Album Art", "Photography", "Video Editing",
];

const PROJECT_TYPES = [
  "Public", "Member", "Private (Premium Add-on)",
];

interface SearchFiltersProps {
  filters: {
    genre?: string;
    mood?: string;
    talent?: string;
    projectType?: string;
    isAuditioning?: boolean;
    isListed?: boolean;
    sortBy?: string;
  };
  onFilterChange: (key: string, value: string | boolean | undefined) => void;
  onClearFilters: () => void;
}

export function SearchFilters({ filters, onFilterChange, onClearFilters }: SearchFiltersProps) {
  const hasActiveFilters = Object.values(filters).some((v) => v !== undefined);

  return (
    <div className="flex flex-wrap gap-2 items-center">
      <Select
        value={filters.genre ?? ""}
        onValueChange={(v) => onFilterChange("genre", v || undefined)}
      >
        <SelectTrigger className="w-[130px] bg-card/50 border-border/50 text-sm h-9">
          <SelectValue placeholder="Genre" />
        </SelectTrigger>
        <SelectContent>
          {GENRES.map((g) => (
            <SelectItem key={g} value={g}>{g}</SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select
        value={filters.mood ?? ""}
        onValueChange={(v) => onFilterChange("mood", v || undefined)}
      >
        <SelectTrigger className="w-[120px] bg-card/50 border-border/50 text-sm h-9">
          <SelectValue placeholder="Mood" />
        </SelectTrigger>
        <SelectContent>
          {MOODS.map((m) => (
            <SelectItem key={m} value={m}>{m}</SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select
        value={filters.talent ?? ""}
        onValueChange={(v) => onFilterChange("talent", v || undefined)}
      >
        <SelectTrigger className="w-[140px] bg-card/50 border-border/50 text-sm h-9">
          <SelectValue placeholder="Talent" />
        </SelectTrigger>
        <SelectContent>
          {TALENTS.map((t) => (
            <SelectItem key={t} value={t}>{t}</SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select
        value={filters.projectType ?? ""}
        onValueChange={(v) => onFilterChange("projectType", v || undefined)}
      >
        <SelectTrigger className="w-[130px] bg-card/50 border-border/50 text-sm h-9">
          <SelectValue placeholder="Type" />
        </SelectTrigger>
        <SelectContent>
          {PROJECT_TYPES.map((t) => (
            <SelectItem key={t} value={t}>{t}</SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select
        value={filters.sortBy ?? ""}
        onValueChange={(v) => onFilterChange("sortBy", v || undefined)}
      >
        <SelectTrigger className="w-[120px] bg-card/50 border-border/50 text-sm h-9">
          <SelectValue placeholder="Sort by" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="recent">Recent</SelectItem>
          <SelectItem value="views">Most Views</SelectItem>
          <SelectItem value="likes">Most Likes</SelectItem>
        </SelectContent>
      </Select>

      {hasActiveFilters && (
        <Button
          variant="ghost"
          size="sm"
          className="h-9 text-xs text-muted-foreground"
          onClick={onClearFilters}
        >
          <X className="h-3 w-3 mr-1" />
          Clear
        </Button>
      )}
    </div>
  );
}
