<!--
  PrintArtZ.co.in — PROJECT BACKBONE FILE
  This file is the single source of truth for planning, design, decisions, and progress.
  It is updated after each working session/prompt run. Push manually as needed.
-->

# PrintArtZ.co.in — Project Log & Backbone

> **Purpose:** This document is the backbone of the whole project. It combines the
> living working log (status, decisions, next steps) with the full implementation plan.
> It is updated after each prompt run so work is never lost across shutdowns/restarts.

---

## 0. How to use this file

- **Top sections (1–6)** are the *living* parts — status, checklists, decisions, and next steps. These change often.
- **Section 7 onward** is the *stable* implementation plan (design, architecture, phases). This changes rarely.
- After each working session, the assistant updates the **Session Log** and relevant checklists.
- The user pushes to GitHub manually from time to time.

---

## 1. Snapshot (updated each session)

| Field | Value |
|---|---|
| Product | PrintArtZ.co.in — India-first printable school-project image generator for parents |
| Repo | `Yuushann/printartz` (personal GitHub account) |
| Working branch | `develop` |
| Local path | `C:\Amit_Data\Pet Project\printartz` |
| Current phase | **Phase 1 — Foundation complete** (monorepo, DB, UI, CI); next: Phase 2 auth |
| Last updated | 2026-09-12 |

---

## 2. Services & credentials checklist

Legend: ✅ done · 🔷 in progress · ⬜ not started · ⏸ deferred

### Tier 1 — needed to start building
| Service | Status | Notes / credentials |
|---|---|---|
| GitHub (personal `Yuushann`) | ✅ | Repo cloned; SSH auth working via alias `github.com-personal` |
| OpenAI Platform API key | ✅ | Verified; `AI_TEXT_MODEL=gpt-4o-mini`, `AI_IMAGE_MODEL=gpt-image-1` (dall-e-3 NOT available on this account). Spend cap $10/mo. |
| PostgreSQL (**Supabase**) | ✅ | Verified (PG 17.6, ap-south-1). Pooler host is `aws-1` not `aws-0` after resume. |
| Redis (Upstash) | ✅ | Verified via ioredis. `rediss://` (TLS), Mumbai, eviction off. |
| Google OAuth | ✅ | Client + `AUTH_SECRET` set; localhost redirect for dev. Consent screen in Testing mode. |

### Tier 2 — generation → payment → download flow
| Service | Status | Notes / credentials |
|---|---|---|
| Object storage (**Supabase Storage**) | ✅ | S3 creds + buckets (`printartz-previews`, `printartz-finals`) in `.env.local`. S3-compatible adapter so we can swap to Cloudflare R2 later if egress grows. |
| Razorpay | 🔷 | Test keys verified (test order created). Webhook secret + live KYC deferred. |
| Resend (email) | ⬜ | Deferred — blocked on domain going fully active for DNS domain-verify. `EMAIL_FROM`/`SUPPORT_EMAIL` set to `@printartz.co.in`. |

### Tier 3 — production launch
| Service | Status | Notes |
|---|---|---|
| Domain PrintArtZ.co.in + DNS | 🔷 | Registered on GoDaddy (3-yr term). Domain KYC/validation in progress. DNS not configured yet. (`.com` was taken by an investor.) |
| Vercel (frontend hosting) | ⬜ | Connect repo, env vars, custom domain |
| Worker host (Railway/Render/Fly.io) | ⬜ | Long jobs can't run serverless |
| Sentry (monitoring) | ⬜ | `SENTRY_DSN` |
| Analytics (PostHog/Plausible) | ⏸ | Optional |
| Legal pages (privacy, ToS, refund, etc.) | ⬜ | Before production |

---

## 3. Environment / machine setup (done)

- **Two GitHub accounts in parallel** on this machine:
  - Global git identity = company (`Amit Kumar Dhara <adhara@infoblox.com>`).
  - Folder `C:\Amit_Data\Pet Project\` uses **personal** identity (`Yuushann <amit.dhara2010@gmail.com>`) via a git `includeIf` conditional include (`C:\Users\adhara\.gitconfig-personal`).
  - Personal SSH key: `~/.ssh/id_ed25519_personal` (passphrase-free), registered on `Yuushann`.
  - SSH host alias `github.com-personal` in `~/.ssh/config` → forces the personal key.
  - Repo remote uses `git@github.com-personal:Yuushann/printartz.git`.
- Tooling present: git 2.50, gh 2.95, ssh (OpenSSH).

---

## 4. Decisions log

### Resolved
- **Repo hosting:** personal GitHub account `Yuushann`, private repo `printartz`, working on `develop`.
- **Cost strategy:** self-funded pet project — minimize spend, prefer free tiers; only unavoidable recurring costs are domain (~₹1k/yr) + OpenAI usage (hard-capped).
- **DB + Storage provider:** **Supabase** for both (free tier, single account). Storage stays behind an S3-compatible adapter so it can move to Cloudflare R2 later if egress grows.

### Open decisions (from plan §18 — resolve before/at relevant phase)
- [ ] Final AI provider for text + image generation (default: OpenAI).
- [ ] Final hosting provider combination (leaning Vercel free + local/free worker).
- [ ] Email login: magic link vs OTP.
- [ ] First release downloads: PDF only vs PDF + JPEG.
- [ ] Chart paper sizes: Indian market-standard vs configurable custom from day one.
- [ ] Gallery examples: user opt-in vs admin-only internal examples.

---

## 5. Session log (most recent first)

### 2026-09-13/14 (sessions 4–5) — live launch, product build-out, renderer V2/V3

**Phase 1 finish → Waves:** Google sign-in (Auth.js v5) + colorful redesign; **OpenAI image pipeline** (`packages/ai`: `planRequest` guardrail+prompt extraction via gpt-4o-mini, `generateImageFromPrompt`/`…WithReferences` via gpt-image-1); **/api/generate** (login-gated, zod, quota, persists ProjectRequest/GenerationJob). Fixed auth `Configuration` bug (added `User.emailVerified`). Kid/parent redesign + `/gallery`. Reference-image upload (images/edits). Iterative "regenerate with a change".

**Print accuracy:** `packages/rendering` (pdf-lib) — **V1** exact paper-size PDF + cut border + 100mm ruler. **V2** client-side canvas whitespace-trim → accurate single-object cm sizing (`lib/trim-image.ts`). **V3 "generate-then-compose"** — `renderCutoutSheetPdf` tiles N copies of one clean isolated object at exact cm across multi-page grids (best for cutout sheets); `single` AI option draws one die-cut object.

**HOSTING — WENT LIVE:** chose **Render** (persistent server, no request timeout) over Vercel. Blueprint from `render.yaml`, deploy branch `develop`, Node pinned 22.14.0, health check `/api/health`. **Live at https://printartz.co.in** with SSL (GoDaddy A `@`→216.24.57.1, CNAME `www`→onrender). Free-tier keep-warm via UptimeRobot on `/api/health`.

**Design overhaul:** dark mode default (pure-black tokens) + theme dropdown (Light/Dark/Warm/High-contrast); header restructured (centered "PrintArtZ" label, right-aligned nav, far-left Home, mobile hamburger); Contact/Help/Reviews/How-it-works as modals (portal to body); photographic Pexels backdrops; Firefox scroll-jank fixed (pause anim on scroll + `content-visibility` + fixed wash + no permanent will-change).

**Accounts & data:** **email+password auth** (Auth.js switched to **JWT sessions** + Credentials + bcryptjs; `/login`, `/api/signup`); **profile modal** (editable name, generation stats); **Resend email verification** (`/verify`, gated generation, link built from request host); **gated 5-star feedback** stored per user (after download, capped prompts) + anonymous name-only reviews; **Reviews** modal (sort/filter, prompt-summary header, IST time). Store planner `imagePrompt`. New `LEGEND` role = unlimited (Super User). Free quota set to 5.

**Provisioning completed:** **Resend** (domain verified via GoDaddy Domain Connect, API key). All services now live except the Razorpay flow (test keys stored, flow not built).

**Branches:** `feature/first_build` frozen (tag `first-build-live`); active work on `second_build` → merged to `develop` (Render deploys). **Remaining:** Razorpay payment flow; real V3 print testing.
- Added **"🔧 Service setup"** tab to `docs/tutorial/` documenting every service's registration/keys/DNS/config.

### 2026-09-12 (session 3)
- Resumed after long gap: **un-paused Supabase**; fixed stale pooler host (`aws-0`→`aws-1`) in `DATABASE_URL`/`DIRECT_URL`; verified DB (PG 17.6).
- Provisioned + **verified live**: **OpenAI** (fixed image model to `gpt-image-1`; dall-e-3 not on account; $10/mo spend cap), **Upstash Redis** (`rediss://` TLS, Mumbai), **Razorpay** test keys (test order created).
- Configured **Google OAuth** (localhost redirect, Testing mode) + generated `AUTH_SECRET`.
- **Domain:** `printartz.com` was taken by an investor → registered **`printartz.co.in`** on GoDaddy (3-yr). Rebranded domain refs in this doc + `.env.local`/`.env.example` emails to `.co.in`.
- Hardened `.gitignore` (all `.env*` except `.env.example`).
- **Started + completed Phase 1 scaffolding:**
  - pnpm monorepo; `apps/web` = Next.js 15.5 (App Router, TS, Tailwind v4); `packages/shared` (constants, paper presets, zod schema); homepage live & tested.
  - `packages/db` = Prisma 6 base schema **pushed to Supabase (12 tables verified)**.
  - shadcn/ui (dependency-free) + `/create` project-submission page with zod validation.
  - GitHub Actions CI (install, prisma generate/validate, typecheck, lint, build); all steps pass locally.
  - Commits `3e3e84a`..`a634ef8` on `develop` (not yet pushed).
- **Deferred:** Resend (needs domain active), local Docker (using cloud services). **Next:** push to GitHub; Phase 2 (auth wiring with the OAuth creds).

### 2026-07-30 (session 2)
- Reviewed DB/storage options through a **cost lens** (free tiers).
- **Decision:** Supabase for both DB + Storage (all free, single login); keep storage behind S3-compatible adapter for future R2 swap.
- Confirmed overall near-zero-cost stack (Upstash, Vercel, Resend, Sentry free tiers; only domain + capped OpenAI cost real money).
- Committed & pushed backbone file to `develop` (commit `840b748`).
- **Next:** create Supabase project, capture `DATABASE_URL` + storage keys.

### 2026-07-30 (session 1)
- Fetched the full implementation plan from prior session into this workspace.
- Reviewed complete services/credentials checklist; organized into Tier 1/2/3.
- Set up **two-GitHub-account** workflow (company global + personal folder-scoped) with dedicated SSH key + host alias.
- Fixed an SSH key passphrase quirk (literal `""` passphrase → removed).
- Verified auth as `Yuushann`; **cloned repo** and checked out `develop`.
- Created this backbone file (`docs/PROJECT_LOG.md`).
- **Next:** decide DB + storage provider, then provision Tier 1 credentials.

---

## 6. Next steps (rolling)

1. **Create Supabase project** → capture `DATABASE_URL` (pooled + direct), project URL, anon/service keys, and Storage S3 credentials.
2. Provision remaining **Tier 1** credentials (OpenAI, Upstash Redis, Google OAuth).
3. Begin **Phase 1: Foundation** — scaffold the monorepo (Next.js, TS, Tailwind, shadcn/ui, Prisma, base schema, local Docker, base CI).

---
---

# IMPLEMENTATION PLAN (stable)

<!-- The sections below are the detailed, relatively stable plan. -->

## 1. Product summary

PrintArtZ.co.in is an India-first web application for parents who need accurate, printable school-project images and cutouts for young children. The user can paste school instructions, select or confirm required options, preview a watermarked result, and download a high-quality printable PDF or JPEG after payment when applicable.

The most important product promise is print accuracy: paper size, cutout dimensions, margins, color, and layout must be deterministic and reliable. AI should help understand the school instruction and generate visual assets, but final page size and object placement must be controlled by application code.

## 2. Core product boundaries

### Allowed use cases

- Nursery, kindergarten, and school art-project printables.
- Printable cutouts such as animals, fruits, flowers, objects, shapes, charts, labels, headings, and project decorations.
- Coloring sheets and simple black-and-white project images.
- A4, chart paper, half chart paper, and later custom paper sizes.
- Realistic, cartoon, coloring-book, sketch, and similar child-safe visual styles.
- Project chart layouts where multiple visual elements need to be placed on a page.

### Rejected use cases

- General AI chat.
- Coding, technical help, essays, letters, poems, or unrelated homework solving.
- Adult, violent, political, hateful, unsafe, or otherwise inappropriate content.
- Prompt-injection attempts such as "ignore previous instructions".
- Copyrighted characters, brand logos, trademarked assets, celebrity likenesses, or requests to copy an existing protected work.
- Any request that is not primarily for a printable kids' school-project image.

Rejected message:

> This request does not meet the criteria for school project image generation. Please provide instructions for a printable kids' art or school project image.

## 3. MVP scope

The MVP should support a flexible school-project flow, not a narrow single-template flow. However, it should remain constrained to printable school-project output.

Initial supported categories:

1. Cutout sheet
2. Coloring sheet
3. Project chart layout
4. Labels and headings

Initial input dimensions:

- Paper type: A4, chart paper, half chart paper.
- Paper color.
- Cutout contents.
- Required sizes or counts when available.
- Style: realistic, cartoon, coloring-book, sketch.

Complex unorthodox projects, such as a full summer season chart with many elements and composition requirements, should be handled later through a guided multi-step flow.

## 4. High-level user flow

1. User visits homepage and browses public examples.
2. User logs in before generating.
3. User pastes school instruction and optionally selects paper/style preferences.
4. System runs safety, abuse, copyright, and domain checks.
5. If invalid, the request is rejected before expensive AI/image generation.
6. If valid, AI extracts structured project requirements.
7. If required details are missing, AI asks clarification questions.
8. Once enough data exists, the generation job starts.
9. Quota or paid-generation cost is charged only after an image is successfully generated.
10. User sees a low-resolution watermarked preview.
11. User pays for high-quality download when required.
12. User downloads print-ready PDF or JPEG.
13. Admin can approve selected outputs for the homepage gallery after anonymizing or modifying the source instruction.

## 5. Pricing and quota rules

### Generation quota

- Each user gets 10 free successful image generations.
- Clarification questions are free and do not count against the quota.
- Invalid/rejected requests do not count against the quota.
- Failed generation attempts should not count against the quota unless a usable preview is produced.
- After the free quota is exhausted, each successful generation costs INR 1.50.
- User dashboard should show free generations remaining and paid generation spend.

### Download pricing

Pricing is based on total successful paid/download-unlocked images across the platform:

- First 500 downloaded images: INR 5 per image.
- Downloads 501 to 1000: INR 10 per image.
- Downloads after 1000: INR 15 per image.
- Price should be calculated server-side at checkout time.
- Admin should be able to update future pricing tiers later.

## 6. Recommended technical stack

### Application

- Frontend: Next.js, React, TypeScript.
- Styling: Tailwind CSS and shadcn/ui.
- Backend: Next.js API routes/server actions initially.
- Future backend option: NestJS or FastAPI if generation jobs become large enough to split.
- Validation: Zod.
- ORM: Prisma.
- Database: PostgreSQL.
- Queue: BullMQ with Redis.
- Image processing: sharp.
- PDF generation/layout: pdf-lib, SVG-based rendering, or server-side browser rendering with Playwright/Puppeteer after evaluation.
- Storage: S3-compatible object storage.
- Auth: Auth.js/NextAuth with Google OAuth and email magic link or OTP.
- Payments: Razorpay.
- Monitoring: Sentry.
- Analytics: PostHog or Plausible.
- Email: Resend, AWS SES, or similar.

### AI services

- Text model for request classification, instruction extraction, clarification questions, and prompt planning.
- Image generation model for visual asset creation.
- The final printable layout must be generated deterministically by application code, not trusted to the image model.

Preferred initial AI provider can be OpenAI for speed of implementation. The architecture should keep the AI provider behind an internal adapter so it can be replaced later.

## 7. Architecture

### Main components

1. Web app
   - Homepage
   - Login
   - Prompt submission
   - Clarification flow
   - Preview page
   - Payment page
   - Download history
   - User spending/quota page

2. API/backend
   - Auth/session endpoints
   - Project request endpoints
   - Eligibility and guardrail checks
   - Generation job creation
   - Payment order creation
   - Razorpay webhook handling
   - Signed download URL generation
   - Gallery and admin APIs

3. Worker
   - Runs generation jobs.
   - Calls AI services.
   - Produces visual assets.
   - Composes exact print layout.
   - Creates preview and final PDF/JPEG files.
   - Uploads files to object storage.

4. Database
   - Stores users, requests, checks, jobs, files, payments, downloads, and gallery examples.

5. Object storage
   - Stores previews, generated assets, and final downloads.
   - Final download files must be private.
   - Access should happen through short-lived signed URLs.

## 8. Guardrail pipeline

Every request must pass this pipeline before generation:

1. Basic input validation
   - Length limits.
   - File/type restrictions when uploads are added.
   - Rate limiting.

2. Safety moderation
   - Reject unsafe, adult, violent, or harmful content.

3. Domain classifier
   - Allow only printable kids' school-project image requests.
   - Reject general AI usage, coding, writing, and unrelated tasks.

4. Prompt-injection detection
   - Ignore instructions asking the model to reveal prompts, bypass rules, or act outside the product scope.

5. Copyright/trademark check
   - Reject requests involving known copyrighted characters, brands, celebrities, or direct copying of existing protected art.

6. Structured extraction
   - Convert the valid prompt into a typed project specification.

7. Completeness check
   - Ask clarification questions when paper size, object size, count, layout, or style is ambiguous.

## 9. Print accuracy strategy

The printable output should be controlled by deterministic layout code.

Important implementation rules:

- Store all dimensions internally in millimeters.
- Convert to pixels only at export boundaries based on DPI.
- Prefer PDF as the primary final format.
- Support JPEG export as secondary output.
- Use predefined paper presets for A4, chart paper, and half chart paper.
- Include margins, bleed, cut lines, and optional calibration ruler where useful.
- Preview should not be used as the final printable source.
- The high-quality PDF should contain the exact page size and layout.

Recommended early print tests:

- A4 full-page test.
- A4 cutout dimension test.
- Multiple cutouts per page.
- Background paper color test.
- PDF print at 100% scale test.
- JPEG export dimension test.

## 10. Security and anti-theft model

It is not possible to fully prevent screenshots or screen recording in a browser. The system should instead protect high-quality assets and make copied previews less useful.

Controls:

- Show only low-resolution previews before payment.
- Add visible watermark to previews.
- Do not expose high-quality file URLs before payment.
- Store final files privately.
- Use signed URLs with short expiry for downloads.
- Disable right-click and simple drag-save on preview as a minor deterrent.
- Render previews through controlled endpoints or canvas where practical.
- Add rate limits for generation and preview access.
- Log suspicious activity.
- Use CSRF protection and secure session cookies.
- Verify all Razorpay payments through webhooks and signatures.

## 11. Data model draft

Core entities:

- User
- Account/AuthSession
- ProjectRequest
- EligibilityCheck
- ClarificationMessage
- GenerationJob
- GeneratedAsset
- PreviewFile
- FinalDownloadFile
- PaymentOrder
- PaymentTransaction
- Download
- PricingTier
- GalleryExample
- AuditLog

Key status examples:

- ProjectRequest: draft, rejected, needs_clarification, ready_for_generation, generating, generated, failed, paid, downloadable.
- GenerationJob: queued, running, succeeded, failed, cancelled.
- Payment: created, pending, paid, failed, refunded.

## 12. CI/CD plan

### Repository strategy

Use a single monorepo initially:

- apps/web: Next.js app.
- apps/worker: background worker.
- packages/db: Prisma schema and DB client.
- packages/shared: shared types, Zod schemas, constants.
- packages/ai: AI provider adapters and prompt templates.
- packages/rendering: print layout and export logic.

### GitHub Actions

Required checks:

- Install dependencies.
- TypeScript type check.
- Lint.
- Unit tests.
- Build web app.
- Build worker.
- Prisma schema validation.
- Security/dependency audit where practical.

Deployment flow:

- Pull request: run checks only.
- Merge to main: deploy staging or production depending on chosen workflow.
- Manual production approval can be added before public launch.

### Environments

- Local
- Staging
- Production

Each environment needs separate database, storage bucket/prefix, Razorpay keys, AI keys, auth callback URLs, and app URLs.

## 13. Local development setup

Recommended local requirements:

- VS Code or JetBrains WebStorm.
- Node.js LTS.
- pnpm.
- Git.
- Docker Desktop for local PostgreSQL and Redis.
- Local environment file with API keys.

Recommended local services:

- PostgreSQL via Docker.
- Redis via Docker.
- Next.js dev server.
- Worker process in a separate terminal.
- Razorpay webhook testing through a tunneling tool such as ngrok or Cloudflare Tunnel.

Expected local commands after repository creation:

```bash
pnpm install
pnpm db:migrate
pnpm dev
pnpm worker:dev
```

Windows equivalents and exact commands should be finalized once the repository scripts are created.

## 14. IDE recommendation

Recommended default:

- VS Code for frontend, backend, worker, Prisma, and GitHub Actions.

Recommended VS Code extensions:

- ESLint
- Prettier
- Prisma
- Tailwind CSS IntelliSense
- GitHub Actions
- Docker
- PostgreSQL/database client extension

Alternative:

- WebStorm is also suitable if preferred, especially for TypeScript-heavy development.

No separate IDE is required for frontend and backend if using the recommended TypeScript monorepo.

## 15. Accounts and services required from founder

Before production launch, the founder should create or provide access to:

1. Domain
   - PrintArtZ.co.in domain registration.
   - DNS management access.

2. GitHub
   - GitHub repository or organization.
   - Access for CI/CD secrets.

3. AI provider
   - OpenAI or selected provider account.
   - API key.
   - Billing enabled.
   - Usage limits configured.

4. Razorpay
   - Razorpay business account.
   - KYC completion.
   - Test and live API keys.
   - Webhook signing secret.

5. Database hosting
   - Supabase, Neon, Railway, Render, AWS RDS, or similar PostgreSQL provider.

6. Redis/queue
   - Upstash Redis, Redis Cloud, Railway Redis, or equivalent.

7. Object storage
   - AWS S3, Cloudflare R2, Supabase Storage, or equivalent.

8. Email
   - Resend, AWS SES, or similar service for login emails and receipts.

9. Hosting
   - Vercel for frontend.
   - Render, Fly.io, Railway, or AWS for worker if Vercel is not enough for background jobs.

10. Monitoring
   - Sentry account.
   - Optional analytics account such as PostHog or Plausible.

11. Legal/business
   - Privacy policy.
   - Terms of service.
   - Refund/cancellation policy.
   - Contact/support email.
   - Copyright and acceptable-use policy.

## 16. AI-agent development approach

We can start with a normal single-agent development workflow. A supervising AI agent with child agents is not necessary at the beginning.

Use specialized agents later only if the codebase grows enough to justify parallel work:

- Child agent 1: frontend/product implementation.
- Child agent 2: backend/jobs/payments implementation.
- Supervisor agent: reviews integration, security, print accuracy, and release readiness.

For the MVP, the better approach is staged implementation with strong checks, tests, and code review rather than multi-agent orchestration.

## 17. Execution phases

### Phase 1: Foundation

- Create monorepo.
- Configure TypeScript, linting, formatting, Tailwind, shadcn/ui.
- Configure PostgreSQL, Prisma, and base schema.
- Set up local Docker services.
- Create basic CI.

### Phase 2: Auth and user accounting

- Add Google login.
- Add email login.
- Add user profile.
- Track free generations.
- Track paid generation spend.

### Phase 3: Request intake and guardrails

- Build prompt form.
- Add safety/domain/copyright checks.
- Add structured extraction.
- Add clarification flow.
- Store request lifecycle.

### Phase 4: Generation and rendering

- Add queue and worker.
- Integrate image generation provider.
- Build deterministic renderer.
- Generate watermarked previews.
- Generate print-ready PDF/JPEG.
- Store files privately.

### Phase 5: Payments and downloads

- Add Razorpay order creation.
- Add Razorpay webhook verification.
- Implement pricing tiers.
- Unlock downloads after payment.
- Add signed download URLs.

### Phase 6: Gallery and admin

- Add admin-only gallery review.
- Add anonymized public examples.
- Add moderation controls.
- Add basic operational dashboard.

### Phase 7: Production readiness

- Add Sentry and logging.
- Add rate limits.
- Add security headers.
- Add backups and restore plan.
- Add production deployment pipeline.
- Add legal pages and support contact.

## 18. Open decisions before execution

Decisions still needed:

- Final AI provider for text and image generation.
- Final hosting provider combination.
- Final database/storage providers.
- Whether email login should be magic link or OTP.
- Whether first release should support only PDF downloads or both PDF and JPEG.
- Whether chart paper sizes should use Indian market-standard dimensions or configurable custom dimensions from day one.
- Whether generated gallery examples require explicit user opt-in or admin can only use internally generated examples.

## 19. Detailed founder setup checklist

### 19.1 IDE and database access

VS Code can be used for the full project, including database work. We do not need a separate IDE for backend/frontend/database.

Recommended database access options:

- Prisma Studio: easiest application-level database browser during development.
- VS Code database extensions: useful for connecting to PostgreSQL from inside VS Code.
- DBeaver: recommended standalone database GUI if a stronger database client is preferred.
- TablePlus/DataGrip: paid alternatives.
- psql CLI: useful for direct terminal access.

Recommended setup:

- Use VS Code for coding.
- Use Prisma Studio for normal local debugging.
- Use DBeaver if deeper SQL inspection is needed.

### 19.2 Data sensitivity and security assumption

Even if the product does not store passwords directly or intentionally collect sensitive documents, it will still store personal and business-relevant data:

- User email addresses.
- Login provider identifiers.
- Payment references.
- Generated project prompts.
- Generated image files.
- Download and spend history.
- Child-related project context entered by parents.

Therefore, the project should still use proper authentication, private storage, signed download URLs, secure environment variables, rate limits, and basic privacy/legal policies. Free-tier services are acceptable for development and early MVP, but security should not be treated as optional.

### 19.3 Recommended low-cost service choices

These choices minimize upfront cost while keeping the architecture production-friendly:

| Area | Recommended starting option | Free/paid expectation |
|---|---|---|
| Domain/DNS | Buy domain from Cloudflare/Namecheap/GoDaddy; use Cloudflare DNS | Domain is paid yearly; Cloudflare DNS can be free |
| GitHub | GitHub free private repository | Free is enough initially |
| Auth | Auth.js/NextAuth with Google OAuth | Auth.js is free; Google OAuth is free for normal app login |
| Database | Neon or Supabase PostgreSQL | Free tier usually available; upgrade later |
| Redis | Upstash Redis | Free tier usually available; upgrade later |
| Storage | Cloudflare R2 or Supabase Storage | Free/low-cost tier usually available; upgrade later |
| Email | Resend | Free tier usually available; domain verification needed for production |
| Frontend hosting | Vercel | Free tier useful for MVP; paid may be needed later |
| Worker hosting | Railway, Render, Fly.io, or similar | Free tiers vary; assume paid may be needed for reliable workers |
| Payments | Razorpay | No monthly fee usually; transaction fees apply |
| Monitoring | Sentry | Free tier usually available |
| Analytics | Plausible/PostHog | PostHog has a free tier; Plausible is usually paid |
| AI | OpenAI or equivalent | Usually pay-as-you-go; set strict usage limits |

Provider free tiers change frequently. Before launch, verify current limits, regional availability, storage limits, bandwidth limits, sleep behavior, and overage pricing in each provider console.

### 19.4 Domain and DNS setup

Steps:

1. Search and register `PrintArtZ.co.in` through Cloudflare Registrar, Namecheap, GoDaddy, or another registrar.
2. Enable WHOIS privacy if available.
3. Use Cloudflare DNS if possible.
4. Add DNS records later for:
   - Main website.
   - Email provider verification.
   - Google OAuth authorized domains.
   - Vercel or selected hosting provider.
5. Keep registrar login protected with two-factor authentication.

Required from founder:

- Domain registrar account.
- Access to DNS dashboard.
- Billing method for yearly domain renewal.

### 19.5 GitHub setup

Steps:

1. Create a GitHub account or organization.
2. Create a private repository for PrintArtZ.
3. Enable branch protection for `main` later.
4. Add GitHub Actions secrets only after services are selected.
5. Use pull requests for changes once the project grows.

Required from founder:

- GitHub account.
- Repository owner/admin access.

### 19.6 OpenAI/API provider setup

Recommended initial approach:

- Use OpenAI for both text intelligence and image generation if the required image model is available in the account.
- Keep all AI calls behind an internal adapter so the provider can be replaced later.
- Use a cheaper text model for classification, guardrails, extraction, and clarification.
- Use the image generation model only after the request passes validation.
- Set daily/monthly spend limits from day one.

OpenAI API key setup steps:

1. Create or log in to an OpenAI Platform account.
2. Go to the API/platform dashboard, not only the consumer ChatGPT product.
3. Add billing/payment method if required.
4. Create a project for `PrintArtZ`.
5. Generate an API key inside that project.
6. Copy the API key once and store it in a secure password manager.
7. Do not paste the key into source code or commit it to GitHub.
8. Add it locally in `.env.local` only after the repository exists.
9. Add it to hosting/worker environment variables for staging and production.
10. Configure usage limits/budgets in the provider dashboard.
11. Rotate the key if it is ever exposed.

Expected environment variables later:

```text
OPENAI_API_KEY=...
AI_TEXT_MODEL=...
AI_IMAGE_MODEL=...
AI_MAX_DAILY_COST=...
```

Model selection principle:

- Text model: prioritize low cost, reliable JSON output, and strong instruction-following.
- Image model: prioritize image quality, style control, and commercial API availability.
- Renderer: never depend on the image model for exact final dimensions.

### 19.7 Razorpay setup

Steps:

1. Create a Razorpay business account.
2. Complete KYC.
3. Enable test mode first.
4. Get test key ID and key secret.
5. Configure webhook endpoint later after backend URL exists.
6. Store webhook signing secret.
7. Test payment success, failure, and webhook replay handling.
8. Switch to live keys only after end-to-end staging validation.

Required from founder:

- Business details.
- Bank account details.
- PAN/GST details if applicable.
- KYC documents.
- Support/refund policy details.

### 19.8 PostgreSQL setup

Recommended starting options:

- Neon: strong free-tier developer experience for PostgreSQL.
- Supabase: PostgreSQL plus optional storage/auth features.
- Railway/Render: simple app+database hosting but free-tier behavior may vary.
- AWS RDS: production-grade, but usually more operationally complex and likely paid.

Recommended MVP choice:

- Use Neon or Supabase PostgreSQL initially.
- Avoid AWS RDS at the very beginning unless there is a specific reason.

Steps:

1. Create provider account.
2. Create project/database for development or staging.
3. Copy the PostgreSQL connection string.
4. Store it in local `.env.local`.
5. Store separate production connection string in hosting secrets.
6. Enable backups when moving beyond MVP.

Expected variable:

```text
DATABASE_URL=postgresql://...
```

### 19.9 Redis/queue setup

Recommended starting option:

- Upstash Redis, because it is simple, serverless-friendly, and usually has a free tier.

Steps:

1. Create Upstash account.
2. Create a Redis database in a nearby region.
3. Copy Redis URL/token.
4. Use it for BullMQ or selected queue system.
5. Set sensible rate limits and job retry limits.

Expected variables:

```text
REDIS_URL=...
```

### 19.10 Object storage setup

Recommended starting options:

- Cloudflare R2: good S3-compatible storage with attractive bandwidth pricing.
- Supabase Storage: easy if already using Supabase.
- AWS S3: industry standard, but configuration and billing can be more complex.

Recommended MVP choice:

- Use Cloudflare R2 if comfortable creating S3-compatible credentials.
- Use Supabase Storage if choosing Supabase for database and wanting fewer vendors.

Steps:

1. Create storage account/project.
2. Create separate buckets or prefixes for previews and final files.
3. Keep final files private.
4. Create access keys with minimum required permissions.
5. Configure CORS only for required domains.
6. Use signed URLs for final downloads.

Expected variables:

```text
S3_ENDPOINT=...
S3_ACCESS_KEY_ID=...
S3_SECRET_ACCESS_KEY=...
S3_BUCKET_PREVIEWS=...
S3_BUCKET_FINALS=...
S3_REGION=...
```

### 19.11 Email setup

Recommended starting option:

- Resend for login emails, receipts, and operational emails.

Steps:

1. Create Resend account.
2. Add and verify sending domain after `PrintArtZ.co.in` DNS is available.
3. Add required DNS records.
4. Create API key.
5. Configure sender addresses such as `support@printartz.co.in` and `no-reply@printartz.co.in`.

Expected variables:

```text
EMAIL_PROVIDER_API_KEY=...
EMAIL_FROM=no-reply@printartz.co.in
SUPPORT_EMAIL=support@printartz.co.in
```

### 19.12 Authentication setup

Recommended MVP approach:

- Use Auth.js/NextAuth in the app.
- Use Google OAuth first.
- Add email magic link or OTP after email service is ready.

Google OAuth steps:

1. Create a Google Cloud project.
2. Configure OAuth consent screen.
3. Add authorized redirect URIs for local, staging, and production.
4. Generate client ID and client secret.
5. Store them in environment variables.

Expected variables:

```text
AUTH_SECRET=...
GOOGLE_CLIENT_ID=...
GOOGLE_CLIENT_SECRET=...
NEXTAUTH_URL=...
```

### 19.13 Hosting setup

Recommended MVP hosting:

- Vercel for the Next.js web app.
- Render, Railway, Fly.io, or similar for the worker if background jobs cannot run reliably on Vercel.

Steps:

1. Create Vercel account.
2. Connect GitHub repository.
3. Configure environment variables.
4. Deploy preview builds from pull requests.
5. Add custom domain.
6. Create separate worker hosting account/service if needed.
7. Configure worker environment variables separately.

Important note:

- Background image generation jobs may be too long for serverless request limits. A separate worker process is likely required.

### 19.14 Local development and debugging

Required local tools:

- VS Code.
- Node.js LTS.
- pnpm.
- Git.
- Docker Desktop.
- Optional DBeaver.
- Optional ngrok or Cloudflare Tunnel for webhook testing.

Local services:

- PostgreSQL in Docker.
- Redis in Docker.
- Next.js dev server.
- Worker process in a second terminal.
- Prisma Studio for database inspection.

Expected local workflow after project creation:

```text
pnpm install
pnpm db:migrate
pnpm dev
pnpm worker:dev
pnpm prisma studio
```

For Razorpay webhooks locally:

1. Start local app.
2. Start ngrok or Cloudflare Tunnel.
3. Point Razorpay test webhook to the temporary public URL.
4. Verify webhook signature in the backend.

### 19.15 Legal and policy setup

Required before production:

- Privacy policy.
- Terms of service.
- Refund/cancellation policy.
- Copyright/trademark policy.
- Acceptable-use policy.
- Support email.

Reason:

- Even a small MVP handles user emails, payment metadata, and parent-submitted child project context.


