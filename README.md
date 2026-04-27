# MediCatalogue

A full-stack medical product cataloguing platform. Users browse medicines; admins manage the catalogue. No e-commerce, no cart — pure showcase.

## Tech Stack

- **Frontend**: Next.js 14 (App Router) + TypeScript
- **Styling**: Tailwind CSS + shadcn/ui primitives
- **Database**: PostgreSQL via Docker
- **ORM**: Prisma
- **Auth**: NextAuth.js v5 (credentials, JWT, 8h sessions)
- **Images**: Local filesystem (`/public/uploads/`) + Sharp for WebP conversion

## Quick Start

### Prerequisites
- Node.js 18+
- Docker + Docker Compose
- npm or pnpm

### Setup

```bash
# 1. Clone and enter the project
cd medicatalogue

# 2. Copy and configure environment variables
cp .env.example .env
# Edit .env — generate NEXTAUTH_SECRET with:
#   openssl rand -base64 32   (Linux/Mac)
#   [System.Convert]::ToBase64String([System.Security.Cryptography.RandomNumberGenerator]::GetBytes(32)) (PowerShell)

# 3. Start PostgreSQL
docker-compose up -d

# 4. Install dependencies
npm install

# 5. Run database migrations
npx prisma migrate dev --name init

# 6. Seed the database (creates admin + 15 sample products)
npx prisma db seed

# 7. Start development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the catalogue.

## Default Admin Credentials

```
URL:      http://localhost:3000/admin/login
Email:    admin@medicatalogue.com
Password: ChangeMe@2024!
```

> **⚠️ Change the admin password immediately after first login.**

## Image Storage

Images are stored in `/public/uploads/` (gitignored). This folder is **not** in version control.

In production, back up this folder separately (rsync, S3, etc.).

Each product gets its own directory:
```
public/uploads/products/[productId]/
  ├── 1720000000-abc123.webp       (1200px wide, 85% quality)
  └── thumb-1720000000-abc123.webp (400px wide)
```

## Security Features

- bcrypt password hashing (12 salt rounds)
- JWT sessions with 8-hour expiry, HTTP-only cookies
- Middleware protecting all `/admin/*` routes
- Rate limiting: 5 failed login attempts per IP per 15 minutes → 429
- Full audit log (CREATE, UPDATE, DELETE, LOGIN, LOGIN_FAILED)
- CSRF protection via NextAuth
- Security headers: `X-Frame-Options`, `X-Content-Type-Options`, `Referrer-Policy`, `Permissions-Policy`
- All admin API routes verify session server-side

## Database Management

```bash
npm run db:migrate    # Create and run migrations
npm run db:generate   # Regenerate Prisma client
npm run db:seed       # Seed sample data
npm run db:studio     # Open Prisma Studio
npm run db:reset      # Reset database (DESTRUCTIVE)
```

## Docker

```bash
docker-compose up -d        # Start PostgreSQL (keeps data)
docker-compose down         # Stop (keeps data)
docker-compose down -v      # Stop + wipe all data
```

## Project Structure

```
/app
  /(public)              Public-facing pages
  /(admin)/admin/        Admin dashboard pages
  /api/                  API routes
/components
  /ui/                   shadcn/ui-style component library
  /public/               Public website components
  /admin/                Admin dashboard components
/lib                     Utilities, Prisma client, Zod schemas, audit
/prisma                  Prisma schema + seed script
/types                   TypeScript type definitions
/public/uploads/         Product images (gitignored, back up manually)
/scripts                 Helper scripts (start-db.sh)
```
