// Admin photos management page
"use client";

import { useState, useCallback, useRef, useMemo, useId } from "react";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Plus, ImageIcon } from "lucide-react";
import { PhotoUploadForm } from "@/components/admin/photo-upload-form";
import { SortablePhotoCard } from "@/components/admin/sortable-photo-card";
import { toast } from "sonner";
import {
    DndContext,
    DragOverlay,
    closestCenter,
    KeyboardSensor,
    PointerSensor,
    useSensor,
    useSensors,
    MeasuringStrategy,
    type DragEndEvent,
    type DragStartEvent,
} from "@dnd-kit/core";
import {
    SortableContext,
    rectSortingStrategy,
    sortableKeyboardCoordinates,
    arrayMove,
} from "@dnd-kit/sortable";

interface Photo {
    id: string;
    imageUrl: string;
    storagePath: string;
    caption: string | null;
    order: number;
    createdAt: string;
}

interface PhotosClientProps {
    initialPhotos: Photo[];
    slug: string;
}

function PhotoDragOverlay({ photo }: { photo: Photo | undefined }) {
    if (!photo) return null;
    return (
        <div className="aspect-square overflow-hidden rounded-lg border-2 border-primary bg-muted shadow-xl opacity-80 w-full max-w-[200px]">
            <img
                src={photo.imageUrl}
                alt={photo.caption ?? "Event photo"}
                className="w-full h-full object-cover"
            />
        </div>
    );
}

export default function PhotosClient({ initialPhotos, slug }: PhotosClientProps) {
    const dndId = useId();
    const [photos, setPhotos] = useState<Photo[]>(initialPhotos);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [photoToDelete, setPhotoToDelete] = useState<string | null>(null);
    const [activeId, setActiveId] = useState<string | null>(null);
    const lastMutationRef = useRef<number>(0);

    const sensors = useSensors(
        useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
        useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
    );

    const photoIds = useMemo(() => photos.map((p) => p.id), [photos]);
    const activePhoto = useMemo(
        () => (activeId ? photos.find((p) => p.id === activeId) : undefined),
        [activeId, photos],
    );

    const measuring = useMemo(() => ({
        droppable: { strategy: MeasuringStrategy.Always },
    }), []);

    const fetchPhotos = useCallback(async () => {
        const fetchTime = Date.now();
        try {
            const response = await fetch(`/api/admin/${slug}/photos?_t=${fetchTime}`, {
                cache: "no-store",
            });
            if (response.ok) {
                const data = await response.json();
                if (fetchTime >= lastMutationRef.current) {
                    setPhotos(data.photos);
                }
            }
        } catch (error) {
            console.error("Failed to fetch photos:", error);
        }
    }, [slug]);

    const handleDragStart = useCallback((event: DragStartEvent) => {
        setActiveId(event.active.id as string);
    }, []);

    const handleDragEnd = useCallback(async (event: DragEndEvent) => {
        setActiveId(null);
        const { active, over } = event;
        if (!over || active.id === over.id) return;

        const oldIndex = photos.findIndex((p) => p.id === active.id);
        const newIndex = photos.findIndex((p) => p.id === over.id);
        if (oldIndex === -1 || newIndex === -1) return;

        const reordered = arrayMove(photos, oldIndex, newIndex);
        const previousPhotos = [...photos];

        setPhotos(reordered);
        lastMutationRef.current = Date.now();

        try {
            const response = await fetch(`/api/admin/${slug}/photos/reorder`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ orderedIds: reordered.map((p) => p.id) }),
            });

            if (!response.ok) {
                setPhotos(previousPhotos);
                toast.error("Failed to reorder photos");
            }
        } catch {
            setPhotos(previousPhotos);
            toast.error("Failed to reorder photos");
        }
    }, [photos, slug]);

    const handleDragCancel = useCallback(() => {
        setActiveId(null);
    }, []);

    const handleDelete = async () => {
        if (!photoToDelete) return;

        lastMutationRef.current = Date.now();
        const previousPhotos = [...photos];
        setPhotos((prev) => prev.filter((p) => p.id !== photoToDelete));

        try {
            const response = await fetch(`/api/admin/photos/${photoToDelete}`, {
                method: "DELETE",
            });

            if (response.ok) {
                toast.success("Photo deleted successfully");
                lastMutationRef.current = Date.now();
                fetchPhotos();
            } else {
                setPhotos(previousPhotos);
                toast.error("Failed to delete photo");
            }
        } catch {
            setPhotos(previousPhotos);
            toast.error("An unexpected error occurred");
        } finally {
            setPhotoToDelete(null);
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold">Photo Highlights</h2>
                <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                    <DialogTrigger asChild>
                        <Button>
                            <Plus className="h-4 w-4 mr-2" />
                            Upload Photos
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="admin-theme max-w-lg">
                        <DialogHeader>
                            <DialogTitle>Upload Photos</DialogTitle>
                            <DialogDescription>
                                Add photo highlights for this event. You can select multiple files at once. Supported formats: JPEG, PNG, WebP, GIF (max 10 MB each).
                            </DialogDescription>
                        </DialogHeader>
                        <PhotoUploadForm
                            slug={slug}
                            onSuccess={() => {
                                setIsDialogOpen(false);
                                fetchPhotos();
                            }}
                            onCancel={() => setIsDialogOpen(false)}
                        />
                    </DialogContent>
                </Dialog>
            </div>

            {photos.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 border-2 border-dashed border-border rounded-lg text-center">
                    <div className="w-14 h-14 rounded-full bg-muted flex items-center justify-center mb-4">
                        <ImageIcon className="h-7 w-7 text-muted-foreground" />
                    </div>
                    <p className="text-muted-foreground mb-4">No photos uploaded yet</p>
                    <Button variant="outline" onClick={() => setIsDialogOpen(true)}>
                        <Plus className="h-4 w-4 mr-2" />
                        Upload your first photo
                    </Button>
                </div>
            ) : (
                <DndContext
                    id={dndId}
                    sensors={sensors}
                    collisionDetection={closestCenter}
                    onDragStart={handleDragStart}
                    onDragEnd={handleDragEnd}
                    onDragCancel={handleDragCancel}
                    measuring={measuring}
                >
                    <SortableContext
                        items={photoIds}
                        strategy={rectSortingStrategy}
                    >
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                            {photos.map((photo) => (
                                <SortablePhotoCard
                                    key={photo.id}
                                    photo={photo}
                                    onDelete={setPhotoToDelete}
                                />
                            ))}
                        </div>
                    </SortableContext>
                    <DragOverlay dropAnimation={{ duration: 150, easing: "ease" }}>
                        <PhotoDragOverlay photo={activePhoto} />
                    </DragOverlay>
                </DndContext>
            )}

            <AlertDialog
                open={!!photoToDelete}
                onOpenChange={(open) => !open && setPhotoToDelete(null)}
            >
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Delete this photo?</AlertDialogTitle>
                        <AlertDialogDescription>
                            This action cannot be undone. The photo will be permanently removed from storage and the gallery.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={handleDelete}
                            className="bg-destructive hover:bg-destructive/90"
                        >
                            Delete
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
}
