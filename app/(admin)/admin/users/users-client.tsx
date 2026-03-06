// Admin user management page
"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
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
import { UserForm } from "@/components/admin/user-form";
import { toast } from "sonner";

interface AdminUser {
    id: string;
    email: string;
    role: string;
    isActive: boolean;
    createdAt: string;
}

interface UsersClientProps {
    initialUsers: AdminUser[];
}

export default function UsersClient({ initialUsers }: UsersClientProps) {
    const [users, setUsers] = useState<AdminUser[]>(initialUsers);
    const [isLoading, setIsLoading] = useState(false);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [editingUser, setEditingUser] = useState<AdminUser | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [userToDelete, setUserToDelete] = useState<string | null>(null);

    // Filter states
    const [searchQuery, setSearchQuery] = useState("");
    const [roleFilter, setRoleFilter] = useState("all");
    const [statusFilter, setStatusFilter] = useState("all");

    const fetchUsers = useCallback(async () => {
        try {
            const response = await fetch(`/api/admin/users`);
            if (response.ok) {
                const data = await response.json();
                setUsers(data.users);
            } else {
                const data = await response.json();
                setError(data.error || "Failed to fetch users");
            }
        } catch (error) {
            console.error("Failed to fetch users:", error);
            setError("An unexpected error occurred");
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchUsers();
    }, [fetchUsers]);

    const handleDelete = async () => {
        if (!userToDelete) return;

        const previousUsers = [...users];
        // Optimistic UI toggle could be added here
        setUsers(prev => prev.filter(u => u.id !== userToDelete));

        try {
            const response = await fetch(`/api/admin/users/${userToDelete}`, {
                method: "DELETE",
            });

            if (response.ok) {
                toast.success("User removed from whitelist");
                fetchUsers();
            } else {
                setUsers(previousUsers);
                toast.error("Failed to delete user");
            }
        } catch (error) {
            console.error("Failed to delete user:", error);
            setUsers(previousUsers);
            toast.error("An unexpected error occurred");
        } finally {
            setUserToDelete(null);
        }
    };

    const filteredUsers = useMemo(() => {
        return users.filter((user) => {
            const matchesSearch = user.email.toLowerCase().includes(searchQuery.toLowerCase());
            const matchesRole = roleFilter === "all" || user.role === roleFilter;
            const matchesStatus =
                statusFilter === "all" ? true :
                    statusFilter === "active" ? user.isActive : !user.isActive;

            return matchesSearch && matchesRole && matchesStatus;
        });
    }, [users, searchQuery, roleFilter, statusFilter]);

    const resetFilters = () => {
        setSearchQuery("");
        setRoleFilter("all");
        setStatusFilter("all");
    };

    const formatDate = (dateStr: string) => {
        return new Date(dateStr).toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
            year: "numeric"
        });
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-64">
                <p className="text-muted-foreground">Loading users...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex items-center justify-center h-64 text-destructive">
                <p>{error}</p>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold">Team</h2>
                <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                    <DialogTrigger asChild>
                        <Button onClick={() => setEditingUser(null)}>
                            <Plus className="h-4 w-4 mr-2" />
                            Add User
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="admin-theme max-w-md max-h-[90vh] overflow-y-auto">
                        <DialogHeader>
                            <DialogTitle>
                                {editingUser ? "Edit User role" : "Add Whitelisted User"}
                            </DialogTitle>
                            <DialogDescription>
                                {editingUser
                                    ? "Update role and access settings for this user."
                                    : "Allow a new user to access the admin panel."}
                            </DialogDescription>
                        </DialogHeader>
                        <UserForm
                            user={editingUser}
                            onSuccess={() => {
                                setIsDialogOpen(false);
                                fetchUsers();
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
                                placeholder="Search by email..."
                                className="pl-9"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                        </div>
                        <div className="flex items-center gap-2">
                            <Select value={roleFilter} onValueChange={setRoleFilter}>
                                <SelectTrigger className="w-[140px]">
                                    <SelectValue placeholder="Role" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All Roles</SelectItem>
                                    <SelectItem value="admin">Admin</SelectItem>
                                    <SelectItem value="staff">Staff</SelectItem>
                                </SelectContent>
                            </Select>
                            <Select value={statusFilter} onValueChange={setStatusFilter}>
                                <SelectTrigger className="w-[140px]">
                                    <SelectValue placeholder="Status" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All Status</SelectItem>
                                    <SelectItem value="active">Active</SelectItem>
                                    <SelectItem value="disabled">Disabled</SelectItem>
                                </SelectContent>
                            </Select>
                            {(searchQuery || roleFilter !== "all" || statusFilter !== "all") && (
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
                                <TableHead>Email Address</TableHead>
                                <TableHead>Role</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead>Added On</TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {filteredUsers.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={5} className="text-center py-8">
                                        <p className="text-muted-foreground mb-4">No users found</p>
                                        {(searchQuery || roleFilter !== "all" || statusFilter !== "all") ? (
                                            <Button variant="outline" onClick={resetFilters}>
                                                Clear filters
                                            </Button>
                                        ) : (
                                            <Button
                                                variant="link"
                                                onClick={() => setIsDialogOpen(true)}
                                            >
                                                Add your first user
                                            </Button>
                                        )}
                                    </TableCell>
                                </TableRow>
                            ) : (
                                filteredUsers.map((user) => (
                                    <TableRow key={user.id}>
                                        <TableCell className="font-medium">
                                            {user.email}
                                        </TableCell>
                                        <TableCell className="capitalize">{user.role}</TableCell>
                                        <TableCell>
                                            <Badge
                                                variant={user.isActive ? "default" : "secondary"}
                                                className={user.isActive ? "bg-green-500/10 text-green-600 hover:bg-green-500/20" : ""}
                                            >
                                                {user.isActive ? "Active" : "Disabled"}
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="whitespace-nowrap">
                                            {formatDate(user.createdAt)}
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <div className="flex items-center justify-end gap-2">
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    onClick={() => {
                                                        setEditingUser(user);
                                                        setIsDialogOpen(true);
                                                    }}
                                                >
                                                    <Pencil className="h-4 w-4" />
                                                </Button>
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    onClick={() => setUserToDelete(user.id)}
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

            <AlertDialog open={!!userToDelete} onOpenChange={(open) => !open && setUserToDelete(null)}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                        <AlertDialogDescription>
                            This action cannot be undone. This will permanently remove the user from the whitelist, preventing them from accessing the admin panel.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={handleDelete} className="bg-destructive hover:bg-destructive/90">
                            Remove User
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
}
