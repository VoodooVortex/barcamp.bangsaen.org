// User form component for adding/editing admin users
"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";

interface AdminUser {
    id: string;
    email: string;
    role: string;
    isActive: boolean;
}

interface UserFormProps {
    user?: AdminUser | null;
    onSuccess: () => void;
    onCancel: () => void;
}

export function UserForm({
    user,
    onSuccess,
    onCancel,
}: UserFormProps) {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const [formData, setFormData] = useState({
        email: user?.email || "",
        role: user?.role || "staff",
        isActive: user?.isActive ?? true,
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        setError(null);

        try {
            const url = user
                ? `/api/admin/users/${user.id}`
                : `/api/admin/users`;
            const method = user ? "PATCH" : "POST";

            const response = await fetch(url, {
                method,
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(formData),
            });

            if (response.ok) {
                toast.success(user ? "User updated successfully" : "User added to whitelist");
                onSuccess();
            } else {
                const data = await response.json();
                setError(data.error || "Failed to save user");
                toast.error(data.error || "Failed to save user");
            }
        } catch {
            setError("An unexpected error occurred");
            toast.error("An unexpected error occurred");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
                <div className="p-3 bg-destructive/10 text-destructive rounded-md text-sm">
                    {error}
                </div>
            )}

            <div className="space-y-2">
                <Label htmlFor="email">Email Address *</Label>
                <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    disabled={!!user} // Email cannot be changed after creation
                    required
                />
            </div>

            <div className="space-y-2">
                <Label htmlFor="role">Role *</Label>
                <Select
                    value={formData.role}
                    onValueChange={(value) => setFormData({ ...formData, role: value })}
                >
                    <SelectTrigger>
                        <SelectValue placeholder="Select role" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="admin">Admin (Can manage users and content)</SelectItem>
                        <SelectItem value="staff">Staff (Can manage content only)</SelectItem>
                    </SelectContent>
                </Select>
            </div>

            <div className="flex items-center space-x-2 pt-2">
                <Checkbox
                    id="isActive"
                    checked={formData.isActive}
                    onCheckedChange={(checked) =>
                        setFormData({ ...formData, isActive: checked as boolean })
                    }
                />
                <Label htmlFor="isActive">Active</Label>
            </div>

            <div className="flex justify-end gap-2 pt-4">
                <Button type="button" variant="outline" onClick={onCancel}>
                    Cancel
                </Button>
                <Button type="submit" disabled={isSubmitting}>
                    {isSubmitting ? "Saving..." : user ? "Update" : "Add User"}
                </Button>
            </div>
        </form>
    );
}
