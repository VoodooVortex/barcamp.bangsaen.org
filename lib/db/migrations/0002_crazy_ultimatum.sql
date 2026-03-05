DO $$ BEGIN
 CREATE TYPE "public"."role" AS ENUM('admin', 'staff');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
ALTER TABLE "admin_users" ALTER COLUMN "role" DROP DEFAULT;
ALTER TABLE "admin_users" ALTER COLUMN "role" SET DATA TYPE role USING role::text::role;
ALTER TABLE "admin_users" ALTER COLUMN "role" SET DEFAULT 'staff';