# Barcamp Bangsaen

Barcamp Bangsaen event platform with landing page, live schedule board, admin panel, and social share metadata.

## Overview

Repo นี้ใช้สำหรับรันและพัฒนาเว็บของ Barcamp Bangsaen โดยมี 3 surface หลัก:

- Landing page ที่ `/`
- Live board ที่ `/live/[slug]`
- Admin workspace ที่ `/admin`

ตัวแอปใช้ Next.js App Router แต่รันผ่าน custom server ใน `server.ts` เพื่อรองรับ realtime infrastructure และ route handling ของโปรเจกต์ โดย deployment ปัจจุบันที่อยู่บน Vercel หน้า live จะใช้ polling เป็นหลักไปก่อน

## What This App Includes

- Redesigned landing page พร้อม event summary, archive, และ CTA ไปยัง live board
- Live board สำหรับดู `On Air`, `Up Next`, schedule grid, และสถานะ session โดยปัจจุบัน auto-refresh ผ่าน polling เพราะ deployment ตอนนี้อยู่บน Vercel
- Admin panel สำหรับจัดการ event years, venues, sessions, และผู้ใช้ในระบบ
- Role-based access ผ่าน Supabase Auth + whitelist ในฐานข้อมูล (`admin`, `staff`)
- NTP-backed timing สำหรับลดปัญหาเวลา session เพี้ยนจาก client clock
- Open Graph / Twitter share images สำหรับ link preview เวลาแชร์ในแชทหรือ social platforms

## Tech Stack

- Next.js 16 + React 19 + TypeScript
- Tailwind CSS + shadcn/ui + Framer Motion
- PostgreSQL (Supabase) + Drizzle ORM
- Supabase Auth
- Custom runtime ready + polling-based live refresh for the current Vercel deployment
- Docker + docker-compose

## Local Setup

1. Install dependencies

```bash
pnpm install
```

2. Create local env file

```bash
cp .env.example .env.local
```

3. Fill in Supabase and database credentials in `.env.local`

4. Apply database migrations

```bash
pnpm db:migrate
```

5. Seed sample data if needed

```bash
pnpm db:seed
```

6. Start the dev server

```bash
pnpm dev
```

เปิดที่ [http://localhost:3001](http://localhost:3001)

Note: local development ใช้ custom server บน port `3001` ไม่ใช่ `3000`

## Environment Variables

| Variable | Required | Purpose | Notes |
|---|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Yes | Supabase project URL | ใช้ทั้ง client และ server-side auth flow |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Yes | Supabase anon key | สำหรับ public/client requests |
| `SUPABASE_SERVICE_ROLE_KEY` | Yes | Supabase service role key | ใช้กับ privileged server operations |
| `DATABASE_URL` | Yes | PostgreSQL connection string | ใช้โดย Drizzle ORM และ seed scripts |
| `NEXT_PUBLIC_APP_URL` | Yes | Public app base URL | local dev ควรเป็น `http://localhost:3001` |
| `ALLOWED_ORIGINS` | Yes | Allowed origins for app/runtime access | local dev ควรมี `http://localhost:3001` |

ถ้าจะรัน local ให้ตรวจว่า `NEXT_PUBLIC_APP_URL` และ `ALLOWED_ORIGINS` ใช้ `http://localhost:3001` ให้ตรงกับ `pnpm dev`

## Database Workflow

ใช้ sequence นี้เป็นหลัก:

```bash
pnpm db:generate
pnpm db:migrate
pnpm db:seed
```

ความหมายของแต่ละคำสั่ง:

| Command | Use when | Description |
|---|---|---|
| `pnpm db:generate` | schema เปลี่ยน | สร้าง Drizzle migration จาก schema ปัจจุบัน |
| `pnpm db:migrate` | ต้องการ apply migration | ใช้รัน migration ไปยัง database |
| `pnpm db:seed` | ต้องการ sample data | เติมข้อมูลเริ่มต้นสำหรับ dev/testing |
| `pnpm db:studio` | ต้องการ inspect data | เปิด Drizzle Studio เพื่อดูและแก้ข้อมูล |

ถ้าคุณแค่ clone repo มารัน local ปกติเริ่มที่ `pnpm db:migrate` ก่อน แล้วค่อย `pnpm db:seed` ถ้าต้องการข้อมูลตัวอย่าง

## Available Scripts

| Script | Description |
|---|---|
| `pnpm dev` | Run custom dev server with Next.js + realtime infrastructure on port `3001` |
| `pnpm dev:next` | Run plain Next.js dev server only, without the custom server |
| `pnpm build` | Create production build |
| `pnpm start` | Start production app through `tsx server.ts` |
| `pnpm lint` | Run ESLint |
| `pnpm db:generate` | Generate Drizzle migration files from schema changes |
| `pnpm db:migrate` | Apply Drizzle migrations |
| `pnpm db:seed` | Seed development data |
| `pnpm db:studio` | Open Drizzle Studio |

## App Structure

| Path | Purpose |
|---|---|
| `app/` | Next.js routes, metadata, auth pages, API routes, landing page, and live pages |
| `components/` | Shared UI components, landing page sections, admin UI, and live viewer UI |
| `lib/db/` | Drizzle schema, migrations, database client, and seed script |
| `lib/socket/` | Socket.io server/client utilities and broadcast hooks |
| `server.ts` | Custom HTTP server that boots Next.js and realtime infrastructure together |

## Deployment

### Docker

รันผ่าน Docker Compose:

```bash
docker compose up --build
```

ตัว container ใช้ `.env.local` ตาม `docker-compose.yml` และเปิด service ที่ port `3000`

### Manual

รันแบบ manual production:

```bash
pnpm build
pnpm start
```

Note: production ของโปรเจกต์นี้ไม่ได้รันผ่าน `next start` ตรง ๆ แต่รันผ่าน `tsx server.ts` เพื่อให้ custom server และ realtime infrastructure ทำงานร่วมกัน

ตอนนี้ deployment อยู่บน Vercel ไปก่อน ดังนั้นหน้า live ใช้ polling เป็นหลัก ไม่ได้พึ่ง long-lived Socket.io connection

## Contributing

ถ้าจะ contribute ต่อ เอาแบบสั้น ๆ ตามนี้พอ:

1. ทำงานบน branch แยก
2. รัน `pnpm lint`
3. เช็กหน้า `/`, `/live/[slug]`, `/admin` ถ้างานไปแตะส่วนนั้น
4. ถ้าแตะ schema หรือ share image ให้บอกไว้ใน PR/description สั้น ๆ

## Share Preview / SEO Notes

source of truth ปัจจุบันเกี่ยวกับ social share และ metadata คือ:

- Root metadata อยู่ที่ `app/layout.tsx`
- Live page metadata อยู่ที่ `app/(public)/live/[slug]/page.tsx`
- OG image helper อยู่ที่ `lib/seo.ts`
- Default share image asset อยู่ที่ `public/og-barcamp-bangsaen-4-2026.png`

Note เรื่อง realtime:

- live viewer ปัจจุบัน refresh ข้อมูลผ่าน polling ทุก 10 วินาที
- สาเหตุหลักคือ deployment ปัจจุบันอยู่บน Vercel ซึ่งไม่เหมาะกับ long-lived Socket.io server แบบนี้
- `lib/socket/` และ server broadcast hooks ยังมีอยู่ใน repo สำหรับ custom runtime หรือการต่อยอดภายหลัง

Next.js ยัง expose file-based image routes ผ่าน:

- `app/opengraph-image.png`
- `app/twitter-image.png`

ถ้าต้องการเปลี่ยนภาพแชร์หลักของทั้งเว็บ:

1. อัปเดตรูปใน `public/`
2. ตรวจ logic ใน `lib/seo.ts`
3. เช็ก metadata ใน `app/layout.tsx` และ `app/(public)/live/[slug]/page.tsx`

ถ้า Instagram preview อัปเดตแล้ว แต่ Facebook Messenger ยังไม่อัปเดต มักเป็น cache ของ Meta crawler ให้ re-scrape ผ่าน Meta Sharing Debugger
