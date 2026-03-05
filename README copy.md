# Barcamp Bangsaen

A production-ready web application for Barcamp Bangsaen - a live session viewer with real-time updates and an admin panel for managing sessions and venues.

## Features

- **Live Session Viewer**: Real-time schedule with "On Air Now" and "Up Next" sections
- **NTP Time Synchronization**: Accurate server time for consistent session timing
- **Real-time Updates**: WebSocket-powered instant updates across all clients
- **Admin Panel**: CRUD operations for sessions and venues with role-based access
- **Responsive Design**: Mobile-first approach with beautiful beach + tech theme
- **Dark/Light Mode**: Full theme support with Tailwind CSS

## Tech Stack

| Layer     | Technology                               |
| --------- | ---------------------------------------- |
| Frontend  | Next.js 15 (App Router) + TypeScript     |
| UI        | Tailwind CSS + shadcn/ui + Framer Motion |
| Database  | PostgreSQL (Supabase) + Drizzle ORM      |
| Auth      | Supabase Auth                            |
| Real-time | Socket.io                                |
| Time Sync | NTP (pool.ntp.org)                       |

## Prerequisites

- Node.js 18+ and npm/pnpm/yarn
- PostgreSQL database (Supabase recommended)
- Git

## Quick Start

### 1. Clone and Install

```bash
git clone <repository-url>
cd barcamp-bangsaen
npm install
```

### 2. Environment Variables

Create a `.env.local` file:

```env
# Database
DATABASE_URL="postgresql://username:password@host:port/database"

# Supabase
NEXT_PUBLIC_SUPABASE_URL="your-supabase-url"
NEXT_PUBLIC_SUPABASE_ANON_KEY="your-supabase-anon-key"
SUPABASE_SERVICE_ROLE_KEY="your-service-role-key"

# App
NEXT_PUBLIC_APP_URL="http://localhost:3000"
ALLOWED_ORIGINS="http://localhost:3000,https://yourdomain.com"
```

### 3. Database Setup

```bash
# Generate migrations
npm run db:generate

# Run migrations
npm run db:migrate

# Seed with sample data
npm run db:seed
```

### 4. Start Development Server

For development with Socket.io:

```bash
# Using tsx (recommended for Socket.io)
npx tsx server.ts

# Or using Next.js dev server (no WebSocket support)
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the app.

## Project Structure

```
app/
├── (public)/              # Public pages (live viewer, home)
│   ├── live/[year]/       # Live schedule page
│   └── page.tsx           # Home page
├── (admin)/               # Admin pages (protected)
│   └── admin/[year]/       # Year-specific admin pages
├── api/                   # API routes
│   ├── time/              # Server time endpoint
│   ├── public/[year]/      # Public APIs
│   └── admin/[year]/       # Admin APIs
components/
├── live/                  # Live viewer components
├── admin/                 # Admin components
└── ui/                    # shadcn/ui components
lib/
├── db/                    # Drizzle ORM setup
│   ├── schema.ts          # Database schema
│   ├── seed.ts            # Seed data
│   └── migrations/        # Database migrations
├── socket/                # Socket.io setup
│   ├── server.ts          # Server-side Socket.io
│   └── client.ts          # Client-side hook
├── time/                  # NTP time service
│   └── ntp.ts
└── validations/           # Zod schemas
```

## API Endpoints

### Public APIs (No Auth Required)

| Endpoint                          | Description                       |
| --------------------------------- | --------------------------------- |
| `GET /api/time`                   | Server time with NTP offset       |
| `GET /api/public/[year]/schedule` | Full schedule (sessions + venues) |
| `GET /api/public/[year]/status`   | On Air + Up Next status           |

### Admin APIs (Auth Required)

| Endpoint                          | Description    |
| --------------------------------- | -------------- |
| `GET /api/admin/[year]/venues`    | List venues    |
| `POST /api/admin/[year]/venues`   | Create venue   |
| `PATCH /api/admin/venues/[id]`    | Update venue   |
| `DELETE /api/admin/venues/[id]`   | Delete venue   |
| `GET /api/admin/[year]/sessions`  | List sessions  |
| `POST /api/admin/[year]/sessions` | Create session |
| `PATCH /api/admin/sessions/[id]`  | Update session |
| `DELETE /api/admin/sessions/[id]` | Delete session |

## Database Schema

### EventYear

- `id`, `year`, `name`, `timezone`, `startDate`, `endDate`, `published`

### Venue

- `id`, `eventYearId`, `name`, `order`, `capacity`, `isActive`

### Session

- `id`, `eventYearId`, `venueId`, `title`, `description`, `speakerName`, `speakerBio`
- `startAt`, `endAt`, `tags`, `level`, `livestreamUrl`, `isPublished`

## Authentication

The app uses Supabase Auth. To make a user an admin:

1. Create a user through the signup flow
2. In Supabase Dashboard, go to Authentication > Users
3. Edit the user and add `"role": "admin"` to user metadata

## Deployment

### Vercel (Frontend Only)

```bash
vercel --prod
```

Note: For WebSocket support, use a custom server deployment or serverless functions with external WebSocket service.

### Custom Server (With Socket.io)

```bash
# Build
npm run build

# Start with Socket.io server
npx tsx server.ts
```

### Docker

```dockerfile
FROM node:20-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build
EXPOSE 3000
CMD ["npx", "tsx", "server.ts"]
```

## Environment Variables Reference

| Variable                        | Required | Description                  |
| ------------------------------- | -------- | ---------------------------- |
| `DATABASE_URL`                  | Yes      | PostgreSQL connection string |
| `NEXT_PUBLIC_SUPABASE_URL`      | Yes      | Supabase project URL         |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Yes      | Supabase anon key            |
| `SUPABASE_SERVICE_ROLE_KEY`     | No       | Supabase service role key    |
| `NEXT_PUBLIC_APP_URL`           | Yes      | App base URL                 |
| `ALLOWED_ORIGINS`               | No       | CORS origins for Socket.io   |

## Commands

```bash
# Development
npm run dev              # Next.js dev server
npx tsx server.ts        # Custom server with Socket.io

# Database
npm run db:generate      # Generate migrations
npm run db:migrate       # Run migrations
npm run db:seed          # Seed data
npm run db:studio        # Drizzle Studio GUI

# Build
npm run build            # Production build
npm run start            # Start production server
npm run lint             # Run ESLint
```

## Troubleshooting

### Socket.io Connection Issues

- Check `ALLOWED_ORIGINS` environment variable
- Ensure using custom server (`tsx server.ts`) not `next dev`
- Check firewall settings for port 3000

### Database Connection Issues

- Verify `DATABASE_URL` format: `postgresql://user:pass@host:port/db`
- Ensure database user has proper permissions
- Check if IP is allowlisted (for cloud databases)

### NTP Time Sync Issues

- UDP port 123 must be open for NTP
- Falls back to system time if NTP fails
- Check logs for "NTP sync failed" warnings

## License

MIT License - feel free to use this for your own events!

## Credits

Built for Barcamp Bangsaen - where beach vibes meet tech talks.
