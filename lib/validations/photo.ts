import { z } from "zod";

export const photoUploadSchema = z.object({
    caption: z.string().max(500).optional(),
    order: z.number().int().min(0).default(0),
});

export type PhotoUploadInput = z.infer<typeof photoUploadSchema>;

export const ALLOWED_MIME_TYPES = [
    "image/jpeg",
    "image/png",
    "image/webp",
    "image/gif",
] as const;

export const MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024; // 10 MB
