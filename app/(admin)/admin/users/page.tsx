import { db } from "@/lib/db";
import { adminUsers } from "@/lib/db/schema";
import { desc } from "drizzle-orm";
import { requireAdmin } from "@/lib/auth/admin";
import { redirect } from "next/navigation";
import UsersClient from "./users-client";

export default async function UsersPage() {
    try {
        await requireAdmin();
    } catch {
        redirect("/auth/login?redirect=/admin/users");
    }

    const usersList = await db.query.adminUsers.findMany({
        orderBy: desc(adminUsers.createdAt),
    });

    const serializedUsers = usersList.map(user => ({
        ...user,
        createdAt: user.createdAt.toISOString(),
        updatedAt: user.updatedAt.toISOString(),
    }));

    return <UsersClient initialUsers={serializedUsers} />;
}
