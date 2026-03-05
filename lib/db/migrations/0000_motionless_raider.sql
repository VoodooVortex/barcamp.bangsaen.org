CREATE TABLE IF NOT EXISTS "event_years" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"year" integer NOT NULL,
	"name" text NOT NULL,
	"timezone" text DEFAULT 'Asia/Bangkok' NOT NULL,
	"start_date" timestamp with time zone,
	"end_date" timestamp with time zone,
	"published" boolean DEFAULT false NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "event_years_year_unique" UNIQUE("year")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "sessions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"event_year_id" uuid NOT NULL,
	"venue_id" uuid NOT NULL,
	"title" text NOT NULL,
	"description" text,
	"speaker_name" text NOT NULL,
	"speaker_bio" text,
	"start_at" timestamp with time zone NOT NULL,
	"end_at" timestamp with time zone NOT NULL,
	"tags" text[] DEFAULT '{}' NOT NULL,
	"level" text,
	"livestream_url" text,
	"is_published" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "venues" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"event_year_id" uuid NOT NULL,
	"name" text NOT NULL,
	"order" integer DEFAULT 0 NOT NULL,
	"capacity" integer,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "sessions" ADD CONSTRAINT "sessions_event_year_id_event_years_id_fk" FOREIGN KEY ("event_year_id") REFERENCES "public"."event_years"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "sessions" ADD CONSTRAINT "sessions_venue_id_venues_id_fk" FOREIGN KEY ("venue_id") REFERENCES "public"."venues"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "venues" ADD CONSTRAINT "venues_event_year_id_event_years_id_fk" FOREIGN KEY ("event_year_id") REFERENCES "public"."event_years"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "event_years_year_idx" ON "event_years" USING btree ("year");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "sessions_event_year_id_idx" ON "sessions" USING btree ("event_year_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "sessions_venue_id_idx" ON "sessions" USING btree ("venue_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "sessions_start_at_idx" ON "sessions" USING btree ("start_at");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "sessions_end_at_idx" ON "sessions" USING btree ("end_at");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "venues_event_year_id_idx" ON "venues" USING btree ("event_year_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "venues_order_idx" ON "venues" USING btree ("order");