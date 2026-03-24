// Admin sessions management page
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
import { Plus, Pencil, Trash2, Search, X, Play, Square, RotateCcw } from "lucide-react";
import { SessionForm } from "@/components/admin/session-form";
import { toast } from "sonner";

interface Session {
  id: string;
  venueId: string;
  title: string;
  speakerName: string;
  startAt: string;
  endAt: string;
  actualStartAt: string | null;
  actualEndAt: string | null;
  tags: string[];
  isPublished: boolean;
  venue: {
    id: string;
    name: string;
  };
}

interface SessionsClientProps {
  initialSessions: Session[];
  slug: string;
}

export default function SessionsClient({ initialSessions, slug }: SessionsClientProps) {

  const [sessions, setSessions] = useState<Session[]>(initialSessions);
  const [isLoading, setIsLoading] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingSession, setEditingSession] = useState<Session | null>(null);
  const [sessionToDelete, setSessionToDelete] = useState<string | null>(null);

  // Filter states
  const [searchQuery, setSearchQuery] = useState("");
  const [venueFilter, setVenueFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");

  const lastMutationRef = useRef<number>(0);

  const fetchSessions = useCallback(async () => {
    const fetchTime = Date.now();
    try {
      const response = await fetch(`/api/admin/${slug}/sessions?_t=${fetchTime}`, {
        cache: "no-store"
      });
      if (response.ok) {
        const data = await response.json();
        if (fetchTime >= lastMutationRef.current) {
          setSessions(data.sessions);
        }
      }
    } catch (error) {
      console.error("Failed to fetch sessions:", error);
    } finally {
      setIsLoading(false);
    }
  }, [slug]);

  useEffect(() => {
    fetchSessions();
    
    // ตั้งเวลา Fetch ข้อมูลใหม่ทุกๆ 5 วินาที (Polling) เพื่อให้อัปเดตแบบ quasi-realtime บน Vercel
    const interval = setInterval(() => {
      fetchSessions();
    }, 5000);

    return () => clearInterval(interval);
  }, [fetchSessions]);

  const handleDelete = async () => {
    if (!sessionToDelete) return;

    lastMutationRef.current = Date.now();
    // เก็บค่าเก่าไว้เผื่อ error จะได้ revert กลับ
    const previousSessions = [...sessions];
    // ทำ Optimistic Update อัปเดต UI ทันทีก่อนรอตัว Server
    setSessions(prev => prev.filter(s => s.id !== sessionToDelete));

    try {
      const response = await fetch(`/api/admin/sessions/${sessionToDelete}`, {
        method: "DELETE",
      });

      if (response.ok) {
        toast.success("Session deleted successfully");
        lastMutationRef.current = Date.now();
        fetchSessions(); // fetch ข้อมูลจริงมาทับอีกทีเพื่อความชัวร์
      } else {
        setSessions(previousSessions); // revert กลับ
        toast.error("Failed to delete session");
      }
    } catch (error) {
      console.error("Failed to delete session:", error);
      setSessions(previousSessions); // revert กลับ
      toast.error("An unexpected error occurred");
    } finally {
      setSessionToDelete(null);
    }
  };

  const filteredSessions = useMemo(() => {
    return sessions.filter((session) => {
      const searchLower = searchQuery.toLowerCase();
      const matchesSearch =
        session.title.toLowerCase().includes(searchLower) ||
        session.speakerName.toLowerCase().includes(searchLower);

      const matchesVenue = venueFilter === "all" || session.venueId === venueFilter;

      const matchesStatus =
        statusFilter === "all" ? true :
          statusFilter === "published" ? session.isPublished : !session.isPublished;

      return matchesSearch && matchesVenue && matchesStatus;
    });
  }, [sessions, searchQuery, venueFilter, statusFilter]);

  // Extract unique venues for the filter dropdown
  const uniqueVenues = useMemo(() => {
    const venuesMap = new Map();
    sessions.forEach(session => {
      if (session.venue && !venuesMap.has(session.venueId)) {
        venuesMap.set(session.venueId, session.venue.name);
      }
    });
    return Array.from(venuesMap.entries()).map(([id, name]) => ({ id, name }));
  }, [sessions]);

  const resetFilters = () => {
    setSearchQuery("");
    setVenueFilter("all");
    setStatusFilter("all");
  };

  const formatTimeRange = (startStr: string, endStr: string) => {
    if (!startStr) return "TBA";
    const start = new Date(startStr);
    const startDateStr = start.toLocaleString("en-US", { month: "short", day: "numeric" });
    const startTimeStr = start.toLocaleString("en-US", { hour: "2-digit", minute: "2-digit", hour12: false });

    if (!endStr) return `${startDateStr}, ${startTimeStr}`;

    const end = new Date(endStr);
    const endDateStr = end.toLocaleString("en-US", { month: "short", day: "numeric" });
    const endTimeStr = end.toLocaleString("en-US", { hour: "2-digit", minute: "2-digit", hour12: false });

    if (startDateStr === endDateStr) {
      return `${startDateStr}, ${startTimeStr} - ${endTimeStr}`;
    }
    return `${startDateStr}, ${startTimeStr} - ${endDateStr}, ${endTimeStr}`;
  };

  const handleSessionControl = async (sessionId: string, action: "start" | "end" | "reset") => {
    lastMutationRef.current = Date.now();
    // เก็บค่าเก่าไว้ก่อน
    const previousSessions = [...sessions];
    
    // ทำ Optimistic Update ให้ UI ตอบสนองทันที
    setSessions(prev => prev.map(s => {
      if (s.id !== sessionId) return s;
      const now = new Date().toISOString();
      if (action === "start") return { ...s, actualStartAt: now, actualEndAt: null };
      if (action === "end") return { ...s, actualEndAt: now };
      if (action === "reset") return { ...s, actualStartAt: null, actualEndAt: null };
      return s;
    }));

    try {
      const response = await fetch(`/api/admin/sessions/${sessionId}/control`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action }),
      });

      if (response.ok) {
        const actionText = action === "reset" ? "reset" : action === "start" ? "started" : "ended";
        toast.success(`Session ${actionText} successfully`);
        lastMutationRef.current = Date.now();
        fetchSessions(); // อัปเดต state ตัวจริงจาก server ให้ตรงกัน
      } else {
        const data = await response.json();
        setSessions(previousSessions); // revert ถ้า request fail
        toast.error(data.error || `Failed to ${action} session`);
      }
    } catch {
      setSessions(previousSessions); // revert ถ้า request fail
      toast.error("An unexpected error occurred");
    }
  };

  const getSessionLiveStatus = (session: Session) => {
    if (session.actualEndAt) return "ended";
    if (session.actualStartAt) return "live";
    // Also check scheduled time — if startAt <= now && endAt > now, it's auto-live
    const now = new Date();
    const start = new Date(session.startAt);
    const end = new Date(session.endAt);
    if (start <= now && end > now) return "live";
    if (end <= now) return "ended";
    return "scheduled";
  };


  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-muted-foreground">Loading sessions...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Sessions</h2>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => setEditingSession(null)}>
              <Plus className="h-4 w-4 mr-2" />
              Add Session
            </Button>
          </DialogTrigger>
          <DialogContent className="admin-theme max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {editingSession ? "Edit Session" : "Create Session"}
              </DialogTitle>
              <DialogDescription>
                {editingSession
                  ? "Update session details, schedule, and visibility."
                  : "Create a new session for this event year."}
              </DialogDescription>
            </DialogHeader>
            <SessionForm
              slug={slug}
              session={editingSession}
              onSuccess={() => {
                setIsDialogOpen(false);
                fetchSessions();
              }}
              onCancel={() => setIsDialogOpen(false)}
            />
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader className="py-4 px-6 border-b border-border/50">
          <div className="flex flex-col xl:flex-row items-center gap-4">
            <div className="relative flex-1 w-full">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by title or speaker..."
                className="pl-9"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <Select value={venueFilter} onValueChange={setVenueFilter}>
                <SelectTrigger className="w-[140px] md:w-[160px]">
                  <SelectValue placeholder="Venue" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Venues</SelectItem>
                  {uniqueVenues.map(venue => (
                    <SelectItem key={venue.id} value={venue.id}>{venue.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>



              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[140px]">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="published">Published</SelectItem>
                  <SelectItem value="draft">Draft</SelectItem>
                </SelectContent>
              </Select>

              {(searchQuery || venueFilter !== "all" || statusFilter !== "all") && (
                <Button variant="ghost" className="h-10 w-10 p-0" onClick={resetFilters}>
                  <X className="h-4 w-4" />
                </Button>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Title</TableHead>
                <TableHead>Speaker</TableHead>
                <TableHead>Venue</TableHead>
                <TableHead className="min-w-[230px]">Time</TableHead>
                <TableHead>Live</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredSessions.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8">
                    <p className="text-muted-foreground mb-4">No sessions found</p>
                    {(searchQuery || venueFilter !== "all" || statusFilter !== "all") ? (
                      <Button variant="outline" onClick={resetFilters}>
                        Clear filters
                      </Button>
                    ) : (
                      <Button
                        variant="link"
                        onClick={() => setIsDialogOpen(true)}
                      >
                        Create your first session
                      </Button>
                    )}
                  </TableCell>
                </TableRow>
              ) : (
                filteredSessions.map((session) => (
                  <TableRow key={session.id}>
                    <TableCell className="font-medium">
                      {session.title}
                    </TableCell>
                    <TableCell>{session.speakerName}</TableCell>
                    <TableCell>{session.venue.name}</TableCell>
                    <TableCell className="whitespace-nowrap">
                      {formatTimeRange(session.startAt, session.endAt)}
                    </TableCell>
                    <TableCell>
                      {(() => {
                        const status = getSessionLiveStatus(session);
                        if (status === "live") {
                          return (
                            <div className="flex items-center gap-1.5">
                              <Badge className="bg-[#1E293B] hover:bg-[#1E293B]/90 text-[#FEFAE0] text-xs">
                                ● On Air
                              </Badge>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-7 w-7 text-[#1E293B]/60 hover:text-[#1E293B]"
                                onClick={() => handleSessionControl(session.id, "end")}
                                title="End session"
                              >
                                <Square className="h-3.5 w-3.5" />
                              </Button>
                            </div>
                          );
                        }
                        if (status === "ended") {
                          const canReset = session.actualEndAt && new Date(session.endAt) > new Date();
                          return (
                            <div className="flex items-center gap-1.5">
                              <Badge variant="outline" className="text-xs text-muted-foreground border-border">
                                Ended
                              </Badge>
                              {canReset && (
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-7 w-7 text-muted-foreground hover:text-foreground"
                                  onClick={() => handleSessionControl(session.id, "reset")}
                                  title="Reset session"
                                >
                                  <RotateCcw className="h-3.5 w-3.5" />
                                </Button>
                              )}
                            </div>
                          );
                        }
                        return (
                          <Button
                            variant="outline"
                            size="sm"
                            className="h-7 text-xs border-[#1E293B]/20 text-[#1E293B] hover:bg-[#1E293B]/5"
                            onClick={() => handleSessionControl(session.id, "start")}
                          >
                            <Play className="h-3 w-3 mr-1" />
                            Start
                          </Button>
                        );
                      })()}
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={session.isPublished ? "default" : "secondary"}
                      >
                        {session.isPublished ? "Published" : "Draft"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => {
                            setEditingSession(session);
                            setIsDialogOpen(true);
                          }}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => setSessionToDelete(session.id)}
                          className="text-destructive hover:text-destructive"
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

      <AlertDialog open={!!sessionToDelete} onOpenChange={(open) => !open && setSessionToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the session and remove it from the schedule.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive hover:bg-destructive/90">
              Delete Session
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
