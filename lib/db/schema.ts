import {
    pgTable,
    uuid,
    text,
    integer,
    boolean,
    timestamp,
    index,
    pgEnum,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";

// Event Years table
export const eventYears = pgTable(
    "event_years",
    {
        id: uuid("id").primaryKey().defaultRandom(),
        slug: text("slug").notNull().unique(),
        name: text("name").notNull(),
        year: integer("year"),
        edition: integer("edition"),
        location: text("location"),
        timezone: text("timezone").default("Asia/Bangkok").notNull(),
        startDate: timestamp("start_date", { withTimezone: true }),
        endDate: timestamp("end_date", { withTimezone: true }),
        ticketUrl: text("ticket_url"),
        ticketOpenDate: timestamp("ticket_open_date", { withTimezone: true }),
        ticketCloseDate: timestamp("ticket_close_date", { withTimezone: true }),
        published: boolean("published").default(false).notNull(),
        isCurrentYear: boolean("is_current_year").default(false).notNull(),
        createdAt: timestamp("created_at", { withTimezone: true })
            .defaultNow()
            .notNull(),
        updatedAt: timestamp("updated_at", { withTimezone: true })
            .defaultNow()
            .notNull(),
    },
    (table) => ({
        slugIdx: index("event_years_slug_idx").on(table.slug),
    })
);

export const eventYearsRelations = relations(eventYears, ({ many }) => ({
    venues: many(venues),
    sessions: many(sessions),
    photos: many(eventPhotos),
}));

// Venues table
export const venues = pgTable(
    "venues",
    {
        id: uuid("id").primaryKey().defaultRandom(),
        eventYearId: uuid("event_year_id")
            .references(() => eventYears.id)
            .notNull(),
        name: text("name").notNull(),
        order: integer("order").default(0).notNull(),
        capacity: integer("capacity"),
        isActive: boolean("is_active").default(true).notNull(),
        createdAt: timestamp("created_at", { withTimezone: true })
            .defaultNow()
            .notNull(),
        updatedAt: timestamp("updated_at", { withTimezone: true })
            .defaultNow()
            .notNull(),
    },
    (table) => ({
        eventYearIdx: index("venues_event_year_id_idx").on(table.eventYearId),
        orderIdx: index("venues_order_idx").on(table.order),
    })
);

export const venuesRelations = relations(venues, ({ one, many }) => ({
    eventYear: one(eventYears, {
        fields: [venues.eventYearId],
        references: [eventYears.id],
    }),
    sessions: many(sessions),
}));

// Sessions table
export const sessions = pgTable(
    "sessions",
    {
        id: uuid("id").primaryKey().defaultRandom(),
        eventYearId: uuid("event_year_id")
            .references(() => eventYears.id)
            .notNull(),
        venueId: uuid("venue_id")
            .references(() => venues.id)
            .notNull(),
        title: text("title").notNull(),
        description: text("description"),
        speakerName: text("speaker_name").notNull(),
        speakerBio: text("speaker_bio"),
        startAt: timestamp("start_at", { withTimezone: true }).notNull(),
        endAt: timestamp("end_at", { withTimezone: true }).notNull(),
        actualStartAt: timestamp("actual_start_at", { withTimezone: true }),
        actualEndAt: timestamp("actual_end_at", { withTimezone: true }),
        tags: text("tags").array().default([]).notNull(),
        livestreamUrl: text("livestream_url"),
        isPublished: boolean("is_published").default(true).notNull(),
        createdAt: timestamp("created_at", { withTimezone: true })
            .defaultNow()
            .notNull(),
        updatedAt: timestamp("updated_at", { withTimezone: true })
            .defaultNow()
            .notNull(),
    },
    (table) => ({
        eventYearIdx: index("sessions_event_year_id_idx").on(table.eventYearId),
        venueIdx: index("sessions_venue_id_idx").on(table.venueId),
        startAtIdx: index("sessions_start_at_idx").on(table.startAt),
        endAtIdx: index("sessions_end_at_idx").on(table.endAt),
    })
);

export const sessionsRelations = relations(sessions, ({ one }) => ({
    eventYear: one(eventYears, {
        fields: [sessions.eventYearId],
        references: [eventYears.id],
    }),
    venue: one(venues, {
        fields: [sessions.venueId],
        references: [venues.id],
    }),
}));

// Event Photos table
export const eventPhotos = pgTable(
    "event_photos",
    {
        id: uuid("id").primaryKey().defaultRandom(),
        eventYearId: uuid("event_year_id")
            .references(() => eventYears.id)
            .notNull(),
        imageUrl: text("image_url").notNull(),
        storagePath: text("storage_path").notNull(),
        caption: text("caption"),
        order: integer("order").default(0).notNull(),
        createdAt: timestamp("created_at", { withTimezone: true })
            .defaultNow()
            .notNull(),
    },
    (table) => ({
        eventYearIdx: index("event_photos_event_year_id_idx").on(table.eventYearId),
        orderIdx: index("event_photos_order_idx").on(table.order),
    })
);

export const eventPhotosRelations = relations(eventPhotos, ({ one }) => ({
    eventYear: one(eventYears, {
        fields: [eventPhotos.eventYearId],
        references: [eventYears.id],
    }),
}));

export const ROLES = ["admin", "staff"] as const;
export type Role = (typeof ROLES)[number];
export const roleEnum = pgEnum("role", ROLES);

// Admin Users table (Whitelist)
export const adminUsers = pgTable(
    "admin_users",
    {
        id: uuid("id").primaryKey().defaultRandom(),
        email: text("email").notNull().unique(),
        role: roleEnum("role").notNull().default("staff"),
        isActive: boolean("is_active").default(true).notNull(),
        createdAt: timestamp("created_at", { withTimezone: true })
            .defaultNow()
            .notNull(),
        updatedAt: timestamp("updated_at", { withTimezone: true })
            .defaultNow()
            .notNull(),
    },
    (table) => ({
        emailIdx: index("admin_users_email_idx").on(table.email),
    })
);

// Types
export type EventYear = typeof eventYears.$inferSelect;
export type NewEventYear = typeof eventYears.$inferInsert;
export type Venue = typeof venues.$inferSelect;
export type NewVenue = typeof venues.$inferInsert;
export type Session = typeof sessions.$inferSelect;
export type NewSession = typeof sessions.$inferInsert;
export type AdminUser = typeof adminUsers.$inferSelect;
export type NewAdminUser = typeof adminUsers.$inferInsert;
export type EventPhoto = typeof eventPhotos.$inferSelect;
export type NewEventPhoto = typeof eventPhotos.$inferInsert;
