// Sortable photo card for admin drag-and-drop reorder
"use client";

import { memo } from "react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { GripVertical, Trash2 } from "lucide-react";

interface Photo {
    id: string;
    imageUrl: string;
    caption: string | null;
    order: number;
}

interface SortablePhotoCardProps {
    photo: Photo;
    onDelete: (id: string) => void;
}

function SortablePhotoCardInner({ photo, onDelete }: SortablePhotoCardProps) {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        isDragging,
    } = useSortable({
        id: photo.id,
        transition: null,
    });

    const style = {
        transform: CSS.Translate.toString(transform),
        transition: isDragging ? "none" : "transform 150ms cubic-bezier(0.2, 0, 0.38, 0.9)",
        opacity: isDragging ? 0.3 : 1,
        zIndex: isDragging ? 10 : undefined,
        willChange: isDragging ? "transform" as const : "auto" as const,
    };

    return (
        <div ref={setNodeRef} style={style}>
            {/* Image container with hover overlay */}
            <div className="group relative aspect-square overflow-hidden rounded-lg border border-border bg-muted">
                <img
                    src={photo.imageUrl}
                    alt={photo.caption ?? "Event photo"}
                    className="w-full h-full object-cover transition-transform group-hover:scale-105"
                    loading="lazy"
                />

                {/* Hover overlay */}
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg" />

                {/* Drag handle */}
                <button
                    type="button"
                    {...attributes}
                    {...listeners}
                    className="absolute top-1 left-1 bg-black/60 hover:bg-black/80 text-white rounded p-0.5 opacity-0 group-hover:opacity-100 transition-opacity cursor-grab active:cursor-grabbing z-10"
                >
                    <GripVertical className="h-4 w-4" />
                </button>

                {/* Delete button — centered in the image */}
                <button
                    type="button"
                    onClick={() => onDelete(photo.id)}
                    className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-black/50 hover:bg-red-600 text-white rounded-full p-2 opacity-0 group-hover:opacity-100 transition-all z-10"
                >
                    <Trash2 className="h-5 w-5" />
                </button>
            </div>

            {/* Caption and order — outside the hover overlay */}
            {photo.caption && (
                <p className="text-xs text-muted-foreground mt-1 truncate px-0.5">
                    {photo.caption}
                </p>
            )}
            <p className="text-[10px] text-muted-foreground/60 px-0.5">
                Order: {photo.order}
            </p>
        </div>
    );
}

export const SortablePhotoCard = memo(SortablePhotoCardInner, (prev, next) => {
    return (
        prev.photo.id === next.photo.id &&
        prev.photo.imageUrl === next.photo.imageUrl &&
        prev.photo.caption === next.photo.caption &&
        prev.photo.order === next.photo.order &&
        prev.onDelete === next.onDelete
    );
});
