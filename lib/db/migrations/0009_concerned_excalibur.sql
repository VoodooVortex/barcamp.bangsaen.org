ALTER TABLE "event_years" ADD COLUMN "ticket_url" text;--> statement-breakpoint
ALTER TABLE "event_years" ADD COLUMN "ticket_open_date" timestamp with time zone;--> statement-breakpoint
ALTER TABLE "event_years" ADD COLUMN "ticket_close_date" timestamp with time zone;