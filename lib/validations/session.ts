// Zod validation schemas for session operations
import { z } from "zod";

export const sessionSchema = z.object({
    title: z.string().min(3, "Title must be at least 3 characters").max(200),
    description: z.string().max(2000).optional(),
    speakerName: z.string().min(1, "Speaker name is required").max(100),
    speakerBio: z.string().max(1000).optional(),
    venueId: z.string().uuid("Invalid venue ID"),
    startAt: z.string().datetime("Invalid start time"),
    endAt: z.string().datetime("Invalid end time"),
    tags: z.array(z.string().max(50)).max(10).default([]),
    livestreamUrl: z.string().url().optional().or(z.literal("")),
    isPublished: z.boolean().default(true),
});

export const sessionUpdateSchema = sessionSchema.partial();

export const venueSchema = z.object({
    name: z.string().min(1, "Name is required").max(100),
    order: z.number().int().min(0).default(0),
    capacity: z.number().int().min(1).optional(),
    isActive: z.boolean().default(true),
});

export const venueUpdateSchema = venueSchema.partial();

export type SessionInput = z.infer<typeof sessionSchema>;
export type SessionUpdateInput = z.infer<typeof sessionUpdateSchema>;
export type VenueInput = z.infer<typeof venueSchema>;
export type VenueUpdateInput = z.infer<typeof venueUpdateSchema>;

/**
 * Validate that start time is before end time
 */
export function validateTimeRange(startAt: string, endAt: string): boolean {
    return new Date(startAt) < new Date(endAt);
}

/**
 * Check if two sessions overlap in the same venue
 */
export function sessionsOverlap(
    start1: Date,
    end1: Date,
    start2: Date,
    end2: Date
): boolean {
    return start1 < end2 && end1 > start2;
}
