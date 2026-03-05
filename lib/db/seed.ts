import { db } from "./index";
import { eventYears, venues, sessions } from "./schema";

async function seed() {
    console.log("Seeding database...");

    // Create 2026 event year
    const [event2026] = await db
        .insert(eventYears)
        .values({
            slug: "barcamp-bangsaen-2026",
            name: "Barcamp Bangsaen 2026",
            timezone: "Asia/Bangkok",
            startDate: new Date("2026-03-15T08:00:00+07:00"),
            endDate: new Date("2026-03-15T18:00:00+07:00"),
            published: true,
        })
        .onConflictDoUpdate({
            target: eventYears.slug,
            set: { published: true },
        })
        .returning();

    console.log("Created event year:", event2026.name);

    // Create venues
    const venueData = [
        { name: "Main Hall", order: 1, capacity: 300 },
        { name: "Room A", order: 2, capacity: 100 },
        { name: "Room B", order: 3, capacity: 80 },
        { name: "Workshop Zone", order: 4, capacity: 50 },
    ];

    const createdVenues = await Promise.all(
        venueData.map(async (v) => {
            const [venue] = await db
                .insert(venues)
                .values({
                    ...v,
                    eventYearId: event2026.id,
                })
                .onConflictDoNothing()
                .returning();
            return venue;
        })
    );

    console.log("Created venues:", createdVenues.length);

    // Get venue IDs
    const mainHall = createdVenues.find((v) => v?.name === "Main Hall");
    const roomA = createdVenues.find((v) => v?.name === "Room A");
    const roomB = createdVenues.find((v) => v?.name === "Room B");
    const workshopZone = createdVenues.find((v) => v?.name === "Workshop Zone");

    if (!mainHall || !roomA || !roomB || !workshopZone) {
        console.error("Failed to create venues");
        return;
    }

    // Create sample sessions for March 15, 2026
    const baseDate = new Date("2026-03-15");
    const sessionData = [
        // Main Hall
        {
            venueId: mainHall.id,
            title: "Opening Ceremony & Keynote",
            speakerName: "Barcamp Team",
            startAt: new Date(baseDate.getTime() + 9 * 60 * 60 * 1000), // 09:00
            endAt: new Date(baseDate.getTime() + 10 * 60 * 60 * 1000), // 10:00
            tags: ["keynote", "opening"],

        },
        {
            venueId: mainHall.id,
            title: "The Future of AI in Thailand",
            speakerName: "Dr. Somchai AI",
            startAt: new Date(baseDate.getTime() + 10 * 60 * 60 * 1000), // 10:00
            endAt: new Date(baseDate.getTime() + 11 * 60 * 60 * 1000), // 11:00
            tags: ["ai", "technology"],

        },
        {
            venueId: mainHall.id,
            title: "Building Scalable Web Apps",
            speakerName: "Jane Developer",
            startAt: new Date(baseDate.getTime() + 13 * 60 * 60 * 1000), // 13:00
            endAt: new Date(baseDate.getTime() + 14 * 60 * 60 * 1000), // 14:00
            tags: ["web", "scalability"],

        },
        {
            venueId: mainHall.id,
            title: "Closing & Networking",
            speakerName: "Barcamp Team",
            startAt: new Date(baseDate.getTime() + 17 * 60 * 60 * 1000), // 17:00
            endAt: new Date(baseDate.getTime() + 18 * 60 * 60 * 1000), // 18:00
            tags: ["networking", "closing"],

        },
        // Room A
        {
            venueId: roomA.id,
            title: "React Server Components Deep Dive",
            speakerName: "React Master",
            startAt: new Date(baseDate.getTime() + 10 * 60 * 60 * 1000),
            endAt: new Date(baseDate.getTime() + 11.5 * 60 * 60 * 1000),
            tags: ["react", "frontend"],

        },
        {
            venueId: roomA.id,
            title: "TypeScript Best Practices",
            speakerName: "Type Wizard",
            startAt: new Date(baseDate.getTime() + 13 * 60 * 60 * 1000),
            endAt: new Date(baseDate.getTime() + 14 * 60 * 60 * 1000),
            tags: ["typescript", "javascript"],

        },
        {
            venueId: roomA.id,
            title: "CSS Grid & Flexbox Mastery",
            speakerName: "Style Guru",
            startAt: new Date(baseDate.getTime() + 14.5 * 60 * 60 * 1000),
            endAt: new Date(baseDate.getTime() + 15.5 * 60 * 60 * 1000),
            tags: ["css", "design"],

        },
        // Room B
        {
            venueId: roomB.id,
            title: "PostgreSQL Performance Tuning",
            speakerName: "DB Admin Pro",
            startAt: new Date(baseDate.getTime() + 10 * 60 * 60 * 1000),
            endAt: new Date(baseDate.getTime() + 11 * 60 * 60 * 1000),
            tags: ["database", "postgresql"],

        },
        {
            venueId: roomB.id,
            title: "Docker for Developers",
            speakerName: "Container Expert",
            startAt: new Date(baseDate.getTime() + 11.5 * 60 * 60 * 1000),
            endAt: new Date(baseDate.getTime() + 12.5 * 60 * 60 * 1000),
            tags: ["docker", "devops"],

        },
        {
            venueId: roomB.id,
            title: "Kubernetes 101",
            speakerName: "K8s Captain",
            startAt: new Date(baseDate.getTime() + 14 * 60 * 60 * 1000),
            endAt: new Date(baseDate.getTime() + 15.5 * 60 * 60 * 1000),
            tags: ["kubernetes", "devops"],

        },
        // Workshop Zone
        {
            venueId: workshopZone.id,
            title: "Hands-on Next.js Workshop",
            speakerName: "Next.js Ninja",
            startAt: new Date(baseDate.getTime() + 10 * 60 * 60 * 1000),
            endAt: new Date(baseDate.getTime() + 12 * 60 * 60 * 1000),
            tags: ["nextjs", "workshop"],

        },
        {
            venueId: workshopZone.id,
            title: "AI Prompt Engineering Lab",
            speakerName: "Prompt Engineer",
            startAt: new Date(baseDate.getTime() + 13 * 60 * 60 * 1000),
            endAt: new Date(baseDate.getTime() + 15 * 60 * 60 * 1000),
            tags: ["ai", "workshop"],

        },
    ];

    for (const session of sessionData) {
        await db
            .insert(sessions)
            .values({
                ...session,
                eventYearId: event2026.id,
                isPublished: true,
            })
            .onConflictDoNothing();
    }

    console.log("Created sessions:", sessionData.length);
    console.log("Seeding complete!");
}

seed()
    .catch((error) => {
        console.error("Seed error:", error);
        process.exit(1);
    })
    .finally(() => {
        process.exit(0);
    });
