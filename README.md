# Barcamp Bangsaen

Web application for **Barcamp Bangsaen** -- an unconference by the sea. Provides a real-time live session viewer for attendees and an admin panel for organizers.

## Tech Stack

- **Next.js 15** (App Router) + TypeScript
- **Tailwind CSS** + shadcn/ui + Framer Motion
- **PostgreSQL** (Supabase) + Drizzle ORM
- **Supabase Auth** (email whitelist)
- **Socket.io** for real-time updates
- **Docker** for deployment

## Getting Started

### 1. Install

```bash
pnpm install
```

### 2. Environment Variables

```bash
cp .env.example .env.local
```

Fill in your Supabase and database credentials.

### 3. Database Setup

```bash
pnpm db:generate    # generate migrations
pnpm db:migrate     # apply migrations
pnpm db:seed        # seed sample data
```

### 4. Run

```bash
pnpm dev            # custom server + Socket.io (port 3001)
```

Open [http://localhost:3001](http://localhost:3001)

## Scripts

| Script | Description |
|---|---|
| `pnpm dev` | Dev server with Socket.io |
| `pnpm dev:next` | Next.js dev server only (no WebSocket) |
| `pnpm build` | Production build |
| `pnpm start` | Start production server |
| `pnpm db:generate` | Generate Drizzle migrations |
| `pnpm db:migrate` | Apply migrations |
| `pnpm db:seed` | Seed sample data |
| `pnpm db:studio` | Drizzle Studio GUI |

## Features

- **Live Viewer** -- real-time "On Air" / "Up Next" with countdown, schedule grid, tag filters
- **Admin Panel** -- manage events, sessions, venues, and team members
- **Real-time** -- Socket.io pushes schedule changes to all connected clients instantly
- **NTP Sync** -- server time from `pool.ntp.org` for accurate session timing
- **Role-based Access** -- `admin` (full access) and `staff` (event-scoped) roles

## Deployment

### Docker

```bash
docker compose up --build
```

### Manual

```bash
pnpm build
pnpm start
```