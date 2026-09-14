# PrintArtZ

**Accurate, printable school-project images for parents — made in minutes.**
Paste the (usually messy) message the school sent, pick a paper size, and PrintArtZ
generates a clean, print-ready sheet — including exact-size cutout sheets.

🌐 **Live:** [printartz.co.in](https://printartz.co.in) · India-first · self-funded pet project

---

## What it does

- Parents paste a school instruction (WhatsApp/notice text) on **/create**.
- An LLM **guardrails** the request and **extracts a clean visual prompt** (ignoring physical
  craft steps like "attach a stick").
- An image model draws the artwork; the app returns a preview.
- The browser exports a **print-accurate PDF** at true paper size (A4/chart/half-chart) with a
  100 mm calibration ruler, or a **cutout sheet** that tiles N copies at an exact cm size.
- Sign in with **Google** or **email + password** (with email verification). Free generations
  per user; `LEGEND` role = unlimited. 5-star feedback + a public reviews wall.

## Tech stack

| Layer | Choice |
|---|---|
| Language / UI | TypeScript · React 19 · Next.js 15 (App Router) |
| Styling | Tailwind v4 · shadcn-style components (dependency-free) |
| Database | PostgreSQL (Supabase) via **Prisma** (engine-free client + `@prisma/adapter-pg`) |
| Auth | Auth.js v5 (JWT sessions) — Google OAuth + Credentials (bcrypt) |
| AI | OpenAI — `gpt-4o-mini` (planner/guardrail) + `gpt-image-1` (image) |
| Rendering | `pdf-lib` (deterministic mm-accurate PDFs) |
| Email | Resend (verification / transactional) |
| Payments | Razorpay (test keys; flow WIP) |
| Hosting | Render (persistent Node server; auto-deploy from `develop`) |
| Queue | Upstash Redis (reserved for a future BullMQ worker; unused) |

## Repository map

It's a **pnpm monorepo**: one Next.js app + four shared packages.

```
printartz/
├─ apps/web/                      # the Next.js app (frontend + backend together)
│  ├─ app/
│  │  ├─ layout.tsx               # root shell: <html>, theme init, header, children
│  │  ├─ page.tsx                 # homepage
│  │  ├─ create/page.tsx          # /create (server): auth gate → <CreateForm/>
│  │  ├─ login/page.tsx           # sign in / create account (client)
│  │  ├─ gallery/page.tsx         # examples
│  │  ├─ verify/route.ts          # email verification link target
│  │  └─ api/
│  │     ├─ auth/[...nextauth]/route.ts   # Auth.js endpoints
│  │     ├─ generate/route.ts     # ⭐ the core: prompt → image
│  │     ├─ signup/route.ts       # email+password signup
│  │     ├─ feedback/route.ts     # save a review
│  │     ├─ reviews/route.ts      # list reviews / guest review
│  │     ├─ profile/route.ts      # rename
│  │     └─ health/route.ts       # keep-warm ping
│  ├─ auth.ts                     # NextAuth config (JWT, Google + password)
│  ├─ components/                 # create-form, site-header, modals, …
│  ├─ lib/                        # email.ts, trim-image.ts, utils.ts
│  └─ next.config.ts              # transpilePackages, serverExternalPackages
├─ packages/
│  ├─ shared/    # constants + zod schema (paper sizes, categories, quota)
│  ├─ db/        # Prisma schema + the engine-free client singleton
│  ├─ ai/        # OpenAI calls: planRequest + image generation
│  └─ rendering/ # pdf-lib: renderPrintPdf + renderCutoutSheetPdf
├─ render.yaml   # Render Blueprint (build/start/branch/env)
└─ pnpm-workspace.yaml
```

> A full end-to-end code-flow walkthrough (push→deploy, request lifecycle, the generate
> flow with real data, the ORM path, and a "which file do I touch to change X" index) lives
> in **`docs/tutorial/`** → open `index.html` → the **Code walkthrough** and **Service setup** tabs.

## Getting started (local)

```bash
# prerequisites: Node >= 22.13, pnpm 11
pnpm install                 # installs deps + generates the Prisma client
cp .env.example .env.local   # then fill in real values (see docs/tutorial → Service setup)

pnpm db:push                 # sync the schema to your Supabase database
pnpm dev                     # http://localhost:3000
```

### Common scripts (run from the repo root)

| Script | What it does |
|---|---|
| `pnpm dev` | Next.js dev server (Turbopack) |
| `pnpm build` | production build |
| `pnpm start` | run the production build (`next start`) |
| `pnpm lint` / `pnpm typecheck` | lint / type-check the workspace |
| `pnpm db:push` | push `schema.prisma` to the database |
| `pnpm db:generate` | regenerate the Prisma client |
| `pnpm db:studio` | open Prisma Studio (browse data) |

### Environment variables

Copy `.env.example` → `.env.local` and fill in. Keys: Supabase (`DATABASE_URL`, `DIRECT_URL`),
OpenAI (`OPENAI_API_KEY`, `AI_TEXT_MODEL`, `AI_IMAGE_MODEL`, `AI_IMAGE_QUALITY`), Auth
(`AUTH_SECRET`, `NEXTAUTH_URL`, `AUTH_URL`, `GOOGLE_CLIENT_ID/SECRET`), Resend
(`EMAIL_PROVIDER_API_KEY`, `EMAIL_FROM`), Upstash (`REDIS_URL`), Razorpay, and
`NEXT_PUBLIC_APP_URL`. **Never commit real secrets** — `.env.local` is git-ignored.
Where to get each value: **docs/tutorial → 🔧 Service setup**.

## Deployment

Hosted on **Render** (free tier, persistent Node server — no request timeout). The
`render.yaml` Blueprint sets build/start/branch/env; secret values are set in the Render
dashboard. Pushing to **`develop`** triggers an auto-deploy. An external UptimeRobot monitor
pings `/api/health` to keep the free service warm.

## Branches

- `main` — stable.
- `develop` — integration; **Render deploys this**.
- `feature/first_build` — frozen first-live snapshot (tag `first-build-live`).
- `second_build` — active work. Flow: work on `second_build` → merge to `develop` → deploy.

## Roadmap

- Razorpay payment flow (paid downloads).
- Real-world print testing of the cutout renderer (V3).
- Persist generated images to Supabase Storage (`GeneratedAsset` + buckets).
- Optional BullMQ worker (Upstash) for long jobs.

---

_Self-funded project; built to minimize cost (free tiers) with a capped OpenAI budget._
