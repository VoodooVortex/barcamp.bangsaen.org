// Admin venues management page
"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
// React imports
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
import { Plus, Pencil, Trash2, Search, X } from "lucide-react";
import { VenueForm } from "@/components/admin/venue-form";
import { toast } from "sonner";

interface Venue {
  id: string;
  name: string;
  order: number;
  capacity: number | null;
  isActive: boolean;
}

interface VenuesClientProps {
  initialVenues: Venue[];
  slug: string;
}

export default function VenuesClient({ initialVenues, slug }: VenuesClientProps) {

  const [venues, setVenues] = useState<Venue[]>(initialVenues);
  const [isLoading, setIsLoading] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingVenue, setEditingVenue] = useState<Venue | null>(null);
  const [venueToDelete, setVenueToDelete] = useState<string | null>(null);

  // Filter states
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const fetchVenues = useCallback(async () => {
    try {
      const response = await fetch(`/api/admin/${slug}/venues`);
      if (response.ok) {
        const data = await response.json();
        setVenues(data.venues);
      }
    } catch (error) {
      console.error("Failed to fetch venues:", error);
    } finally {
      setIsLoading(false);
    }
  }, [slug]);

  useEffect(() => {
    fetchVenues();
  }, [fetchVenues]);

  const handleDelete = async () => {
    if (!venueToDelete) return;

    try {
      const response = await fetch(`/api/admin/venues/${venueToDelete}`, {
        method: "DELETE",
      });

      if (response.ok) {
        toast.success("Venue deleted successfully");
        fetchVenues();
      } else {
        const data = await response.json();
        toast.error(data.error || "Failed to delete venue");
      }
    } catch (error) {
      console.error("Failed to delete venue:", error);
      toast.error("An unexpected error occurred");
    } finally {
      setVenueToDelete(null);
    }
  };

  const filteredVenues = useMemo(() => {
    return venues.filter((venue) => {
      const matchesSearch = venue.name.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesStatus =
        statusFilter === "all" ? true :
          statusFilter === "active" ? venue.isActive : !venue.isActive;

      return matchesSearch && matchesStatus;
    });
  }, [venues, searchQuery, statusFilter]);

  const resetFilters = () => {
    setSearchQuery("");
    setStatusFilter("all");
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-muted-foreground">Loading venues...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Venues</h2>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => setEditingVenue(null)}>
              <Plus className="h-4 w-4 mr-2" />
              Add Venue
            </Button>
          </DialogTrigger>
          <DialogContent className="admin-theme">
            <DialogHeader>
              <DialogTitle>
                {editingVenue ? "Edit Venue" : "Create Venue"}
              </DialogTitle>
              <DialogDescription>
                {editingVenue
                  ? "Update venue details for this event year."
                  : "Create a new venue for this event year."}
              </DialogDescription>
            </DialogHeader>
            <VenueForm
              slug={slug}
              venue={editingVenue}
              onSuccess={() => {
                setIsDialogOpen(false);
                fetchVenues();
              }}
              onCancel={() => setIsDialogOpen(false)}
            />
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader className="py-4 px-6 border-b border-border/50">
          <div className="flex flex-col sm:flex-row items-center gap-4">
            <div className="relative flex-1 w-full">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by venue name..."
                className="pl-9"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <div className="flex items-center gap-2">
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[140px]">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                </SelectContent>
              </Select>
              {(searchQuery || statusFilter !== "all") && (
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
                <TableHead>Order</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Capacity</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredVenues.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-8">
                    <p className="text-muted-foreground mb-4">No venues found</p>
                    {(searchQuery || statusFilter !== "all") ? (
                      <Button variant="outline" onClick={resetFilters}>
                        Clear filters
                      </Button>
                    ) : (
                      <Button
                        variant="link"
                        onClick={() => setIsDialogOpen(true)}
                      >
                        Create your first venue
                      </Button>
                    )}
                  </TableCell>
                </TableRow>
              ) : (
                filteredVenues.map((venue) => (
                  <TableRow key={venue.id}>
                    <TableCell>{venue.order}</TableCell>
                    <TableCell className="font-medium">{venue.name}</TableCell>
                    <TableCell>{venue.capacity || "-"}</TableCell>
                    <TableCell>
                      <Badge variant={venue.isActive ? "default" : "secondary"}>
                        {venue.isActive ? "Active" : "Inactive"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => {
                            setEditingVenue(venue);
                            setIsDialogOpen(true);
                          }}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => setVenueToDelete(venue.id)}
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

      <AlertDialog open={!!venueToDelete} onOpenChange={(open) => !open && setVenueToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the venue and it will no longer be available for assigning sessions.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive hover:bg-destructive/90">
              Delete Venue
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
