CREATE TABLE IF NOT EXISTS "event_photos" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"event_year_id" uuid NOT NULL,
	"image_url" text NOT NULL,
	"storage_path" text NOT NULL,
	"caption" text,
	"order" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "event_photos" ADD CONSTRAINT "event_photos_event_year_id_event_years_id_fk" FOREIGN KEY ("event_year_id") REFERENCES "public"."event_years"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "event_photos_event_year_id_idx" ON "event_photos" USING btree ("event_year_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "event_photos_order_idx" ON "event_photos" USING btree ("order");