# HexaNovaUpdates

An AI-powered auto-blogging platform that discovers trending topics, generates SEO-optimized articles, and publishes them automatically — across 6 content categories.

## Features

- **AI Content Generation** — Groq LLM writes full articles from trending RSS headlines
- **6 Categories** — Tech, Celebrities, Viral, Finance, Health, Travel
- **Auto-publish Pipeline** — BullMQ workers run on schedule (trend detection every 30 min, publish every 2 hrs)
- **Rich Admin Panel** — Manage posts, sources, comments, analytics, newsletter, and settings
- **Newsletter** — Subscriber management + automatic email on publish via SMTP
- **Image Sourcing** — Unsplash → Pexels → Openverse → Lorem Picsum fallback chain (always resolves)
- **SEO-ready** — Structured data (JSON-LD), Open Graph, sitemap.xml, robots.txt
- **AdSense Ready** — Plug in your publisher ID and ad units appear automatically
- **TipTap Editor** — Rich-text post editing in the admin panel
- **Docker Compose** — One command to run the full stack locally or in production

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 15 (App Router) + TypeScript 5.6 |
| AI | Groq API (llama-3.3-70b-versatile) |
| Database | PostgreSQL 16 + Drizzle ORM |
| Queue | Redis 7 + BullMQ |
| Auth | NextAuth.js v5 (JWT, credentials) |
| Styling | Tailwind CSS v4 + Radix UI |
| Email | Nodemailer (SMTP) |
| Containers | Docker + Docker Compose |

## Project Structure

```
hexanovaupdates/
├── src/
│   ├── app/
│   │   ├── (public)/          # Public-facing pages (homepage, category, article)
│   │   ├── (admin)/           # Admin panel (protected by NextAuth)
│   │   └── api/               # API routes (auth, cron, newsletter, track, upload)
│   ├── actions/               # Next.js Server Actions
│   ├── components/            # Shared UI components + admin forms
│   ├── lib/
│   │   ├── ai/                # Groq content generator
│   │   ├── db/                # Drizzle schema + client
│   │   ├── email/             # Nodemailer mailer + newsletter helpers
│   │   ├── images/            # Image fetching chain (Unsplash/Pexels/Openverse/Picsum)
│   │   ├── queue/             # BullMQ queue definitions
│   │   ├── rss/               # RSS feed parser
│   │   └── seo/               # Metadata + structured data builders
│   └── workers/               # BullMQ worker process (trend detection + generation + publish)
├── scripts/
│   └── seed.ts                # Seeds admin user + 13 RSS sources
├── drizzle/
│   └── migrations/            # SQL migration files
├── docker-compose.yml
├── Dockerfile
├── Dockerfile.worker
└── .env.local                 # (not committed — copy from .env.example)
```

## Prerequisites

- [Docker Desktop](https://www.docker.com/products/docker-desktop/) (includes Docker Compose)
- A [Groq API key](https://console.groq.com/) (free tier available)

Optional (for richer images):
- [Unsplash Developer API key](https://unsplash.com/developers)
- [Pexels API key](https://www.pexels.com/api/)

## Quick Start

### 1. Clone & configure

```bash
git clone https://github.com/YOUR_USERNAME/hexanovaupdates.git
cd hexanovaupdates
cp .env.example .env.local
```

Edit `.env.local` and fill in at minimum `GROQ_API_KEY` and `NEXTAUTH_SECRET`.

### 2. Build & migrate

```bash
# Build images
docker compose build --no-cache

# Run DB migrations
docker compose run --rm worker sh -c "npx drizzle-kit push --config=drizzle.config.ts --force"

# Seed admin user + RSS sources
docker compose run --rm worker sh -c "npx tsx scripts/seed.ts"
```

### 3. Start

```bash
docker compose up -d
```

App is live at **http://localhost:3000**
Admin panel at **http://localhost:3000/admin**

Default admin credentials (change after first login):
- Email: `harisali709@gmail.com`
- Password: `admin123456`

### Windows one-liner (after first setup)

```bat
docker compose up -d
```

## Environment Variables

Copy `.env.example` to `.env.local` and configure:

| Variable | Required | Description |
|---|---|---|
| `NEXTAUTH_URL` | Yes | Public URL of your site (e.g. `http://localhost:3000`) |
| `NEXTAUTH_SECRET` | Yes | Random secret — run `openssl rand -base64 32` |
| `DATABASE_URL` | Auto | Set by Docker Compose — override for external DB |
| `REDIS_URL` | Auto | Set by Docker Compose — override for external Redis |
| `GROQ_API_KEY` | Yes | Groq API key for AI content generation |
| `UNSPLASH_ACCESS_KEY` | No | Unsplash image API key (priority 1) |
| `PEXELS_API_KEY` | No | Pexels image API key (priority 2) |
| `NEXT_PUBLIC_ADSENSE_ID` | No | Google AdSense publisher ID (`ca-pub-XXXXXXXX`) |

> SMTP settings (host, port, user, password) are configured in the admin panel under **Settings**, stored in the database.

## Categories

| Slug | Label |
|---|---|
| `tech` | Technology |
| `celebs` | Celebrities |
| `viral` | Viral |
| `finance` | Finance |
| `health` | Health |
| `travel` | Travel |

Routes: `/{category}` and `/{category}/{slug}`

## Background Workers

Workers run inside the `worker` Docker service:

| Job | Schedule | Description |
|---|---|---|
| `detect-trends` | Every 30 min | Fetches RSS feeds, scores trending topics |
| `generate-content` | Triggered | Generates article from trend via Groq |
| `auto-publish` | Every 2 hrs | Publishes scheduled posts |

## Admin Panel Pages

| Path | Description |
|---|---|
| `/admin` | Dashboard |
| `/admin/posts` | All posts + backfill missing images |
| `/admin/posts/[id]` | Edit post (TipTap rich text editor) |
| `/admin/sources` | Manage RSS sources |
| `/admin/comments` | Moderate comments |
| `/admin/analytics` | Page view chart |
| `/admin/newsletter` | Subscriber list + send broadcast |
| `/admin/settings` | Site settings + SMTP config |

## Deployment

The stack is fully containerized. For production:

1. Set `NEXTAUTH_URL` to your public domain
2. Replace default DB password in `docker-compose.yml`
3. Configure reverse proxy (Nginx / Caddy) to port 3000
4. Run the same compose commands as Quick Start

## License

MIT
