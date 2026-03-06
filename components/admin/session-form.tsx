// Session form component for creating/editing sessions
"use client";

import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { DateTimePicker } from "@/components/ui/date-time-picker";
import { X } from "lucide-react";
import { toast } from "sonner";

interface Venue {
  id: string;
  name: string;
}

interface Session {
  id: string;
  title: string;
  description?: string | null;
  speakerName: string;
  speakerBio?: string | null;
  startAt: string;
  endAt: string;
  tags: string[];
  livestreamUrl?: string | null;
  isPublished: boolean;
  venueId: string;
}

interface SessionFormProps {
  slug: string;
  session?: Session | null;
  onSuccess: () => void;
  onCancel: () => void;
}

export function SessionForm({
  slug,
  session,
  onSuccess,
  onCancel,
}: SessionFormProps) {
  const [venues, setVenues] = useState<Venue[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [tagInput, setTagInput] = useState("");

  const [formData, setFormData] = useState({
    title: session?.title || "",
    description: session?.description || "",
    speakerName: session?.speakerName || "",
    speakerBio: session?.speakerBio || "",
    venueId: session?.venueId || "",
    startAt: session?.startAt
      ? new Date(session.startAt)
      : (undefined as Date | undefined),
    endAt: session?.endAt
      ? new Date(session.endAt)
      : (undefined as Date | undefined),
    tags: session?.tags || [],
    livestreamUrl: session?.livestreamUrl || "",
    isPublished: session?.isPublished ?? true,
  });

  const fetchVenues = useCallback(async () => {
    try {
      const response = await fetch(`/api/admin/${slug}/venues`);
      if (response.ok) {
        const data = await response.json();
        setVenues(data.venues);
      }
    } catch (error) {
      console.error("Failed to fetch venues:", error);
    }
  }, [slug]);

  useEffect(() => {
    fetchVenues();
  }, [fetchVenues]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      const url = session
        ? `/api/admin/sessions/${session.id}`
        : `/api/admin/${slug}/sessions`;
      const method = session ? "PATCH" : "POST";

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          startAt: formData.startAt?.toISOString(),
          endAt: formData.endAt?.toISOString(),
        }),
      });

      if (response.ok) {
        toast.success(session ? "Session updated successfully" : "Session created successfully");
        onSuccess();
      } else {
        const data = await response.json();
        setError(data.error || "Failed to save session");
        toast.error(data.error || "Failed to save session");
      }
    } catch {
      setError("An unexpected error occurred");
      toast.error("An unexpected error occurred");
    } finally {
      setIsSubmitting(false);
    }
  };

  const addTag = () => {
    if (tagInput.trim() && !formData.tags.includes(tagInput.trim())) {
      setFormData({
        ...formData,
        tags: [...formData.tags, tagInput.trim()],
      });
      setTagInput("");
    }
  };

  const removeTag = (tag: string) => {
    setFormData({
      ...formData,
      tags: formData.tags.filter((t) => t !== tag),
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <div className="p-3 bg-destructive/10 text-destructive rounded-md text-sm">
          {error}
        </div>
      )}

      <div className="space-y-2">
        <Label htmlFor="title">Title *</Label>
        <Input
          id="title"
          value={formData.title}
          onChange={(e) => setFormData({ ...formData, title: e.target.value })}
          placeholder="e.g. Introduction to AI"
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="speakerName">Speaker Name *</Label>
        <Input
          id="speakerName"
          value={formData.speakerName}
          onChange={(e) =>
            setFormData({ ...formData, speakerName: e.target.value })
          }
          placeholder="e.g. สมชาย ใจดี"
          required
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="venue">Venue *</Label>
          <Select
            value={formData.venueId}
            onValueChange={(value) =>
              setFormData({ ...formData, venueId: value })
            }
            required
          >
            <SelectTrigger>
              <SelectValue placeholder="Select venue" />
            </SelectTrigger>
            <SelectContent>
              {venues.map((venue) => (
                <SelectItem key={venue.id} value={venue.id}>
                  {venue.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Start Time *</Label>
          <DateTimePicker
            date={formData.startAt}
            setDate={(date) => setFormData({ ...formData, startAt: date })}
            placeholder="DD/MM/YYYY HH:mm"
          />
        </div>

        <div className="space-y-2">
          <Label>End Time *</Label>
          <DateTimePicker
            date={formData.endAt}
            setDate={(date) => setFormData({ ...formData, endAt: date })}
            placeholder="DD/MM/YYYY HH:mm"
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          value={formData.description}
          onChange={(e) =>
            setFormData({ ...formData, description: e.target.value })
          }
          rows={3}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="speakerBio">Speaker Bio</Label>
        <Textarea
          id="speakerBio"
          value={formData.speakerBio}
          onChange={(e) =>
            setFormData({ ...formData, speakerBio: e.target.value })
          }
          rows={2}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="livestreamUrl">Livestream URL</Label>
        <Input
          id="livestreamUrl"
          type="url"
          value={formData.livestreamUrl}
          onChange={(e) =>
            setFormData({ ...formData, livestreamUrl: e.target.value })
          }
          placeholder="https://..."
        />
      </div>

      <div className="space-y-2">
        <Label>Tags</Label>
        <div className="flex gap-2">
          <Input
            value={tagInput}
            onChange={(e) => setTagInput(e.target.value)}
            placeholder="Add a tag..."
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                addTag();
              }
            }}
          />
          <Button type="button" onClick={addTag} variant="secondary">
            Add
          </Button>
        </div>
        <div className="flex flex-wrap gap-2 mt-2">
          {formData.tags.map((tag) => (
            <Badge key={tag} variant="secondary" className="gap-1">
              {tag}
              <button
                type="button"
                onClick={() => removeTag(tag)}
                className="ml-1 hover:text-destructive"
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          ))}
        </div>
      </div>

      <div className="flex items-center space-x-2">
        <Checkbox
          id="isPublished"
          checked={formData.isPublished}
          onCheckedChange={(checked) =>
            setFormData({ ...formData, isPublished: checked as boolean })
          }
        />
        <Label htmlFor="isPublished">Publish session</Label>
      </div>

      <div className="flex justify-end gap-2 pt-4">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Saving..." : session ? "Update" : "Create"}
        </Button>
      </div>
    </form>
  );
}
