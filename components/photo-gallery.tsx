// Public event photo gallery with masonry layout and lightbox
"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { X } from "lucide-react";

interface Photo {
    id: string;
    imageUrl: string;
    caption: string | null;
    order: number;
}

interface PhotoGalleryProps {
    photos: Photo[];
}

export function PhotoGallery({ photos }: PhotoGalleryProps) {
    const [lightboxPhoto, setLightboxPhoto] = useState<Photo | null>(null);

    if (photos.length === 0) return null;

    return (
        <>
            {/* Masonry grid — CSS columns, no external library */}
            <div className="columns-2 md:columns-3 lg:columns-4 gap-4">
                {photos.map((photo, i) => (
                    <motion.div
                        key={photo.id}
                        className="break-inside-avoid mb-4"
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.4, delay: Math.min(i * 0.05, 0.5) }}
                    >
                        <div
                            className="relative group cursor-pointer overflow-hidden rounded-xl shadow-sm hover:shadow-md transition-shadow"
                            onClick={() => setLightboxPhoto(photo)}
                        >
                            <img
                                src={photo.imageUrl}
                                alt={photo.caption ?? "Event photo"}
                                className="w-full block object-cover transition-transform duration-300 group-hover:scale-105"
                            />
                            {photo.caption && (
                                <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/60 to-transparent p-3 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <p className="text-white text-xs font-medium line-clamp-2">
                                        {photo.caption}
                                    </p>
                                </div>
                            )}
                        </div>
                    </motion.div>
                ))}
            </div>

            {/* Lightbox */}
            <Dialog open={!!lightboxPhoto} onOpenChange={(open) => !open && setLightboxPhoto(null)}>
                <DialogContent className="max-w-5xl w-full p-0 bg-black/95 border-0 shadow-2xl">
                    <DialogTitle className="sr-only">Photo viewer</DialogTitle>
                    <button
                        onClick={() => setLightboxPhoto(null)}
                        className="absolute top-3 right-3 z-10 bg-white/10 hover:bg-white/20 text-white rounded-full p-1.5 transition-colors"
                    >
                        <X className="h-4 w-4" />
                    </button>
                    {lightboxPhoto && (
                        <div className="flex flex-col items-center">
                            <img
                                src={lightboxPhoto.imageUrl}
                                alt={lightboxPhoto.caption ?? "Event photo"}
                                className="w-full h-auto max-h-[85vh] object-contain rounded-lg"
                            />
                            {lightboxPhoto.caption && (
                                <p className="text-white/70 text-sm text-center px-6 py-3">
                                    {lightboxPhoto.caption}
                                </p>
                            )}
                        </div>
                    )}
                </DialogContent>
            </Dialog>
        </>
    );
}
