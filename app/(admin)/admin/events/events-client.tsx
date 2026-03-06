"use client";

import { useState, useEffect, useCallback, useMemo, useRef } from "react";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
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
import { Plus, Pencil, Trash2, Search, X, Globe, MapPin } from "lucide-react";
import { toast } from "sonner";
import { EventForm } from "@/components/admin/event-form";

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
    venueCount: number;
    sessionCount: number;
}

interface EventsClientProps {
    initialEvents: EventYear[];
}

export default function EventsClient({ initialEvents }: EventsClientProps) {
    const [events, setEvents] = useState<EventYear[]>(initialEvents);
    const [isLoading, setIsLoading] = useState(false);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [editingEvent, setEditingEvent] = useState<EventYear | null>(null);
    const [eventToDelete, setEventToDelete] = useState<string | null>(null);
    const [searchQuery, setSearchQuery] = useState("");

    const lastMutationRef = useRef<number>(0);

    const fetchEvents = useCallback(async () => {
        const fetchTime = Date.now();
        try {
            const response = await fetch(`/api/admin/events?_t=${fetchTime}`, { cache: "no-store" });
            if (response.ok) {
                const data = await response.json();
                if (fetchTime >= lastMutationRef.current) {
                    setEvents(data.events);
                }
            }
        } catch (error) {
            console.error("Failed to fetch events:", error);
            toast.error("Failed to load events");
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchEvents();
    }, [fetchEvents]);

    const handleDelete = async () => {
        if (!eventToDelete) return;

        lastMutationRef.current = Date.now();
        const previousEvents = [...events];
        setEvents(prev => prev.filter(e => e.id !== eventToDelete));

        try {
            const response = await fetch(`/api/admin/events/${eventToDelete}`, {
                method: "DELETE",
            });

            if (response.ok) {
                toast.success("Event deleted successfully");
                lastMutationRef.current = Date.now();
                fetchEvents();
            } else {
                const data = await response.json();
                setEvents(previousEvents);
                toast.error(data.details || data.error || "Failed to delete event");
            }
        } catch (error) {
            console.error("Failed to delete event:", error);
            setEvents(previousEvents);
            toast.error("An unexpected error occurred");
        } finally {
            setEventToDelete(null);
        }
    };

    const handleTogglePublished = async (event: EventYear) => {
        lastMutationRef.current = Date.now();
        const previousEvents = [...events];
        setEvents(prev => prev.map(e => e.id === event.id ? { ...e, published: !e.published } : e));

        try {
            const response = await fetch(`/api/admin/events/${event.id}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ published: !event.published }),
            });

            if (response.ok) {
                toast.success(`Event ${!event.published ? "published" : "unpublished"} successfully`);
                lastMutationRef.current = Date.now();
                fetchEvents();
            } else {
                setEvents(previousEvents);
                toast.error("Failed to update event status");
            }
        } catch {
            setEvents(previousEvents);
            toast.error("An error occurred");
        }
    };

    const filteredEvents = useMemo(() => {
        return events.filter((event) => {
            const searchLower = searchQuery.toLowerCase();
            return (
                event.name.toLowerCase().includes(searchLower) ||
                event.slug.toLowerCase().includes(searchLower)
            );
        });
    }, [events, searchQuery]);

    const formatDate = (dateStr: string | null) => {
        if (!dateStr) return "Not set";
        return new Date(dateStr).toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
            year: "numeric",
            hour: "numeric",
            minute: "2-digit",
        });
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-64">
                <p className="text-muted-foreground">Loading events...</p>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold">Event Years</h2>
                <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                    <DialogTrigger asChild>
                        <Button onClick={() => setEditingEvent(null)}>
                            <Plus className="h-4 w-4 mr-2" />
                            Add Event Year
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="admin-theme max-w-2xl max-h-[90vh] overflow-y-auto">
                        <DialogHeader>
                            <DialogTitle>
                                {editingEvent ? "Edit Event Year" : "Create Event Year"}
                            </DialogTitle>
                            <DialogDescription>
                                {editingEvent
                                    ? "Update event year details and settings."
                                    : "Create a new event year for Barcamp."}
                            </DialogDescription>
                        </DialogHeader>
                        <EventForm
                            event={editingEvent}
                            onSuccess={() => {
                                setIsDialogOpen(false);
                                fetchEvents();
                            }}
                            onCancel={() => setIsDialogOpen(false)}
                        />
                    </DialogContent>
                </Dialog>
            </div>

            <Card>
                <CardHeader className="py-4 px-6 border-b border-border/50">
                    <div className="flex flex-col sm:flex-row items-center gap-4">
                        <div className="relative flex-1 w-full max-w-sm">
                            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                            <Input
                                placeholder="Search by name or slug..."
                                className="pl-9"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                        </div>
                        {searchQuery && (
                            <Button variant="ghost" className="h-10 px-3" onClick={() => setSearchQuery("")}>
                                <X className="h-4 w-4 mr-2" />
                                Clear
                            </Button>
                        )}
                    </div>
                </CardHeader>
                <CardContent className="p-0">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Slug</TableHead>
                                <TableHead>Name</TableHead>
                                <TableHead>Dates</TableHead>
                                <TableHead>Stats</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {filteredEvents.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={6} className="text-center py-8">
                                        <p className="text-muted-foreground mb-4">No events found</p>
                                        {searchQuery ? (
                                            <Button variant="outline" onClick={() => setSearchQuery("")}>
                                                Clear search
                                            </Button>
                                        ) : (
                                            <Button
                                                variant="link"
                                                onClick={() => setIsDialogOpen(true)}
                                            >
                                                Create your first event year
                                            </Button>
                                        )}
                                    </TableCell>
                                </TableRow>
                            ) : (
                                filteredEvents.map((event) => (
                                    <TableRow key={event.id}>
                                        <TableCell>
                                            <div className="flex items-center font-semibold text-base">
                                                {event.slug}
                                                {event.isCurrentYear && (
                                                    <Badge variant="default" className="ml-2 bg-blue-500 hover:bg-blue-600 text-[10px] px-1.5 py-0 h-4 leading-none inline-flex items-center justify-center pt-px">
                                                        ACTIVE
                                                    </Badge>
                                                )}
                                            </div>
                                        </TableCell>
                                        <TableCell className="font-medium">
                                            <div>{event.name}</div>
                                            {event.location && (
                                                <div className="flex items-center gap-1 text-xs text-muted-foreground mt-0.5">
                                                    <MapPin className="h-3 w-3 flex-shrink-0" />
                                                    {event.location}
                                                </div>
                                            )}
                                        </TableCell>
                                        <TableCell className="whitespace-nowrap text-sm text-muted-foreground">
                                            {formatDate(event.startDate)}
                                            {(event.startDate || event.endDate) && " - "}
                                            {formatDate(event.endDate)}
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex flex-col gap-1 text-xs text-muted-foreground">
                                                <span>{event.sessionCount} Sessions</span>
                                                <span>{event.venueCount} Venues</span>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <Button
                                                variant={event.published ? "default" : "secondary"}
                                                size="sm"
                                                className="h-7 text-xs"
                                                onClick={() => handleTogglePublished(event)}
                                            >
                                                {event.published ? (
                                                    <>
                                                        <Globe className="h-3 w-3 mr-1" /> Published
                                                    </>
                                                ) : (
                                                    "Draft"
                                                )}
                                            </Button>
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <div className="flex items-center justify-end gap-2">
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    onClick={() => {
                                                        setEditingEvent(event);
                                                        setIsDialogOpen(true);
                                                    }}
                                                >
                                                    <Pencil className="h-4 w-4" />
                                                </Button>
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    onClick={() => setEventToDelete(event.id)}
                                                    className="text-destructive hover:text-destructive"
                                                    disabled={event.isCurrentYear}
                                                    title={event.isCurrentYear ? "Cannot delete active year" : "Delete event"}
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </Button>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>

            <AlertDialog open={!!eventToDelete} onOpenChange={(open) => !open && setEventToDelete(null)}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                        <AlertDialogDescription>
                            This action cannot be undone. This will permanently delete the event year.
                            You cannot delete an event year that still has associated sessions or venues.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={handleDelete} className="bg-destructive hover:bg-destructive/90">
                            Delete Event Year
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
}
