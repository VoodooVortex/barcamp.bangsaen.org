// Photo upload form component for admin — supports multi-file upload
"use client";

import { useState, useRef, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Upload, X, ImageIcon } from "lucide-react";
import { toast } from "sonner";

interface PhotoUploadFormProps {
    slug: string;
    onSuccess: () => void;
    onCancel: () => void;
}

interface FileWithPreview {
    file: File;
    preview: string;
    id: string;
}

const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"];
const MAX_SIZE = 10 * 1024 * 1024;
const UPLOAD_CONCURRENCY = 4;

export function PhotoUploadForm({ slug, onSuccess, onCancel }: PhotoUploadFormProps) {
    const [files, setFiles] = useState<FileWithPreview[]>([]);
    const [isDragging, setIsDragging] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [progress, setProgress] = useState<string | null>(null);
    const inputRef = useRef<HTMLInputElement>(null);

    const addFiles = useCallback((selected: FileList | File[]) => {
        const newFiles: FileWithPreview[] = [];
        const errors: string[] = [];

        for (const file of Array.from(selected)) {
            if (!ALLOWED_TYPES.includes(file.type)) {
                errors.push(`"${file.name}": invalid type`);
                continue;
            }
            if (file.size > MAX_SIZE) {
                errors.push(`"${file.name}": exceeds 10 MB`);
                continue;
            }
            newFiles.push({
                file,
                preview: URL.createObjectURL(file),
                id: crypto.randomUUID(),
            });
        }

        if (errors.length > 0) {
            setError(`Skipped: ${errors.join(", ")}`);
        } else {
            setError(null);
        }

        if (newFiles.length > 0) {
            setFiles((prev) => [...prev, ...newFiles]);
        }
    }, []);

    const removeFile = useCallback((id: string) => {
        setFiles((prev) => {
            const target = prev.find((f) => f.id === id);
            if (target) URL.revokeObjectURL(target.preview);
            return prev.filter((f) => f.id !== id);
        });
    }, []);

    const clearAll = useCallback(() => {
        files.forEach((f) => URL.revokeObjectURL(f.preview));
        setFiles([]);
        if (inputRef.current) inputRef.current.value = "";
    }, [files]);

    const handleDrop = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
        if (e.dataTransfer.files.length > 0) addFiles(e.dataTransfer.files);
    }, [addFiles]);

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(true);
    };

    const handleDragLeave = () => setIsDragging(false);

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (files.length === 0) {
            setError("Please select at least one image.");
            return;
        }

        setIsSubmitting(true);
        setError(null);

        let successCount = 0;
        let done = 0;
        let next = 0;
        const errors: string[] = [];

        // Upload a few at a time: parallel is much faster than one-by-one, but an
        // unbounded Promise.all would fire every file at once on a big selection.
        const worker = async () => {
            while (next < files.length) {
                const { file } = files[next++];

                try {
                    const formData = new FormData();
                    formData.append("file", file);

                    const response = await fetch(`/api/admin/${slug}/photos`, {
                        method: "POST",
                        body: formData,
                    });

                    if (response.ok) {
                        successCount++;
                    } else {
                        const data = await response.json();
                        errors.push(data.error || `Failed: ${file.name}`);
                    }
                } catch {
                    errors.push(`Failed: ${file.name}`);
                }

                setProgress(`Uploading ${++done}/${files.length}...`);
            }
        };

        await Promise.all(
            Array.from({ length: Math.min(UPLOAD_CONCURRENCY, files.length) }, worker)
        );

        files.forEach((f) => URL.revokeObjectURL(f.preview));

        if (successCount > 0) {
            if (errors.length > 0) {
                toast.success(`Uploaded ${successCount} photo(s), ${errors.length} failed`);
            } else {
                toast.success(`Uploaded ${successCount} photo(s) successfully`);
            }
            onSuccess();
        } else {
            setError(errors.join("; "));
        }

        setIsSubmitting(false);
        setProgress(null);
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            {/* Drop zone */}
            <div
                onDrop={handleDrop}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onClick={() => inputRef.current?.click()}
                className={`
                    relative border-2 border-dashed rounded-lg transition-colors cursor-pointer
                    ${isDragging ? "border-primary bg-primary/5" : "border-border hover:border-primary/50"}
                `}
            >
                <div className="flex flex-col items-center justify-center py-8 px-4 text-center">
                    <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center mb-3">
                        <ImageIcon className="h-6 w-6 text-muted-foreground" />
                    </div>
                    <p className="text-sm font-medium text-foreground mb-1">
                        Drop images here or click to browse
                    </p>
                    <p className="text-xs text-muted-foreground">
                        JPEG, PNG, WebP, GIF — max 10 MB each
                    </p>
                </div>
            </div>

            <input
                ref={inputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp,image/gif"
                multiple
                className="hidden"
                onChange={(e) => {
                    if (e.target.files && e.target.files.length > 0) {
                        addFiles(e.target.files);
                    }
                    // Reset so the same files can be re-selected
                    if (inputRef.current) inputRef.current.value = "";
                }}
            />

            {/* Preview grid */}
            {files.length > 0 && (
                <div className="space-y-2">
                    <div className="flex items-center justify-between">
                        <p className="text-sm text-muted-foreground">
                            {files.length} file{files.length !== 1 ? "s" : ""} selected
                        </p>
                        <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={clearAll}
                            className="text-xs h-7"
                        >
                            Clear all
                        </Button>
                    </div>
                    <div className="grid grid-cols-3 sm:grid-cols-4 gap-2 max-h-60 overflow-y-auto">
                        {files.map((f) => (
                            <div key={f.id} className="relative group aspect-square">
                                <img
                                    src={f.preview}
                                    alt={f.file.name}
                                    className="w-full h-full object-cover rounded-md border border-border"
                                />
                                <button
                                    type="button"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        removeFile(f.id);
                                    }}
                                    className="absolute top-1 right-1 bg-black/60 hover:bg-black/80 text-white rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition-opacity"
                                >
                                    <X className="h-3 w-3" />
                                </button>
                                <p className="absolute bottom-0 left-0 right-0 bg-black/50 text-white text-[9px] px-1 py-0.5 truncate rounded-b-md">
                                    {f.file.name}
                                </p>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Error */}
            {error && (
                <div className="rounded-md bg-destructive/10 px-4 py-3 text-sm text-destructive">
                    {error}
                </div>
            )}

            {/* Progress */}
            {progress && (
                <p className="text-sm text-muted-foreground">{progress}</p>
            )}

            {/* Actions */}
            <div className="flex gap-2 justify-end pt-2">
                <Button type="button" variant="outline" onClick={onCancel} disabled={isSubmitting}>
                    Cancel
                </Button>
                <Button type="submit" disabled={files.length === 0 || isSubmitting}>
                    <Upload className="h-4 w-4 mr-2" />
                    {isSubmitting
                        ? "Uploading..."
                        : `Upload ${files.length || ""} Photo${files.length !== 1 ? "s" : ""}`}
                </Button>
            </div>
        </form>
    );
}
