"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";
import { DateTimePicker } from "@/components/ui/date-time-picker";

interface EventYear {
    id: string;
    slug: string;
    name: string;
    year?: number | null;
    location?: string | null;
    timezone: string;
    startDate: string | null;
    endDate: string | null;
    published: boolean;
    isCurrentYear: boolean;
}

interface EventFormProps {
    event?: EventYear | null;
    onSuccess: () => void;
    onCancel: () => void;
}

export function EventForm({
    event,
    onSuccess,
    onCancel,
}: EventFormProps) {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const [formData, setFormData] = useState({
        slug: event?.slug || "",
        name: event?.name || "",
        year: event?.year ?? null as number | null,
        location: event?.location || "",
        timezone: event?.timezone || "Asia/Bangkok",
        startDate: event?.startDate ? new Date(event.startDate).toISOString() : "",
        endDate: event?.endDate ? new Date(event.endDate).toISOString() : "",
        published: event?.published ?? false,
        isCurrentYear: event?.isCurrentYear ?? false,
    });

    // Auto-generate slug from name + year (only for new events)
    useEffect(() => {
        if (event) return; // Don't auto-generate for edits
        const namePart = formData.name
            .toLowerCase()
            .replace(/[^a-z0-9\s-]/g, '')
            .replace(/\s+/g, '-')
            .replace(/-+/g, '-')
            .trim();
        const yearPart = formData.year ? `-${formData.year}` : '';
        const autoSlug = `${namePart}${yearPart}`.replace(/^-|-$/g, '');
        if (autoSlug) {
            setFormData(prev => ({ ...prev, slug: autoSlug }));
        }
    }, [formData.name, formData.year, event]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        setError(null);

        try {
            const url = event
                ? `/api/admin/events/${event.id}`
                : `/api/admin/events`;
            const method = event ? "PATCH" : "POST";

            const payload = {
                ...formData,
                year: formData.year || null,
                location: formData.location || null,
                startDate: formData.startDate ? new Date(formData.startDate).toISOString() : null,
                endDate: formData.endDate ? new Date(formData.endDate).toISOString() : null,
            };

            const response = await fetch(url, {
                method,
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload),
            });

            if (response.ok) {
                toast.success(event ? "Event updated successfully" : "Event created successfully");
                onSuccess();
            } else {
                const data = await response.json();
                setError(data.error || "Failed to save event");
                toast.error(data.error || "Failed to save event");
            }
        } catch {
            setError("An unexpected error occurred");
            toast.error("An unexpected error occurred");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
                <div className="p-3 bg-destructive/10 text-destructive rounded-md text-sm">
                    {error}
                </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                    <Label htmlFor="name">Event Name *</Label>
                    <Input
                        id="name"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        placeholder="e.g. Barcamp Bangsaen"
                        required
                    />
                </div>

                <div className="space-y-2">
                    <Label htmlFor="year">Year</Label>
                    <Input
                        id="year"
                        type="number"
                        value={formData.year ?? ""}
                        onChange={(e) => setFormData({ ...formData, year: e.target.value ? parseInt(e.target.value) : null })}
                        placeholder="e.g. 2026"
                        min={2000}
                        max={2100}
                    />
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                    <Label htmlFor="slug">Slug (URL identifier) *</Label>
                    <Input
                        id="slug"
                        type="text"
                        placeholder="auto-generated-from-name"
                        value={formData.slug}
                        onChange={(e) => setFormData({ ...formData, slug: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '') })}
                        required
                        disabled={!!event}
                    />
                    {!event && (
                        <p className="text-xs text-muted-foreground">Auto-generated from name + year</p>
                    )}
                </div>

                <div className="space-y-2">
                    <Label htmlFor="location">Location</Label>
                    <Input
                        id="location"
                        value={formData.location}
                        onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                        placeholder="e.g. มหาวิทยาลัยบูรพา บางแสน"
                    />
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2 flex flex-col">
                    <Label htmlFor="startDate">Start Date & Time</Label>
                    <DateTimePicker
                        date={formData.startDate ? new Date(formData.startDate) : undefined}
                        setDate={(date) => setFormData({ ...formData, startDate: date ? date.toISOString() : "" })}
                    />
                </div>

                <div className="space-y-2 flex flex-col">
                    <Label htmlFor="endDate">End Date & Time</Label>
                    <DateTimePicker
                        date={formData.endDate ? new Date(formData.endDate) : undefined}
                        setDate={(date) => setFormData({ ...formData, endDate: date ? date.toISOString() : "" })}
                    />
                </div>
            </div>

            <div className="space-y-2">
                <Label htmlFor="timezone">Timezone</Label>
                <Input
                    id="timezone"
                    value={formData.timezone}
                    onChange={(e) => setFormData({ ...formData, timezone: e.target.value })}
                    placeholder="Asia/Bangkok"
                />
            </div>

            <div className="space-y-3 pt-2">
                <div className="flex items-center space-x-2">
                    <Checkbox
                        id="published"
                        checked={formData.published}
                        onCheckedChange={(checked) =>
                            setFormData({ ...formData, published: checked as boolean })
                        }
                    />
                    <Label htmlFor="published">Published (Visible on public pages)</Label>
                </div>

                <div className="flex items-center space-x-2">
                    <Checkbox
                        id="isCurrentYear"
                        checked={formData.isCurrentYear}
                        onCheckedChange={(checked) =>
                            setFormData({ ...formData, isCurrentYear: checked as boolean })
                        }
                    />
                    <Label htmlFor="isCurrentYear">Active Year (Auto-redirect from /live)</Label>
                </div>
                <p className="text-xs text-muted-foreground ml-6">
                    Note: Setting this as Active Year will override any previously active years.
                </p>
            </div>

            <div className="flex justify-end gap-2 pt-4">
                <Button type="button" variant="outline" onClick={onCancel}>
                    Cancel
                </Button>
                <Button type="submit" disabled={isSubmitting}>
                    {isSubmitting ? "Saving..." : event ? "Update" : "Create"}
                </Button>
            </div>
        </form>
    );
}
