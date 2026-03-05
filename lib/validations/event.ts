import { z } from "zod";

export const eventSchema = z.object({
    slug: z.string().min(1, "Slug is required").max(50).regex(/^[a-z0-9-]+$/, "Slug must contain only lowercase letters, numbers, and hyphens"),
    name: z.string().min(1, "Name is required").max(100),
    year: z.number().int().min(2000).max(2100).optional().nullable(),
    location: z.string().max(200).optional().nullable(),
    timezone: z.string().default("Asia/Bangkok"),
    startDate: z.string().datetime().optional().nullable(),
    endDate: z.string().datetime().optional().nullable(),
    published: z.boolean().default(false),
    isCurrentYear: z.boolean().default(false),
});

export const eventUpdateSchema = eventSchema.partial();

export type EventInput = z.infer<typeof eventSchema>;
export type EventUpdateInput = z.infer<typeof eventUpdateSchema>;

/**
 * Validate that start time is before end time for events
 */
export function validateEventDateRange(startDate?: string | null, endDate?: string | null): boolean {
    if (!startDate || !endDate) return true; // If one is missing, don't fail validation here
    return new Date(startDate) <= new Date(endDate);
}
