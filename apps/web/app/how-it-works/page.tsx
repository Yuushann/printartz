import Link from "next/link";
import type { Metadata } from "next";
import { SITE } from "@printartz/shared";

export const metadata: Metadata = {
  title: `How ${SITE.name} works — architecture & tech stack`,
  description:
    "A living guide to the PrintArtZ tech stack, login flow, and how data moves between the frontend, backend, and services.",
};

const TECH_STACK: { area: string; choice: string; note: string }[] = [
  { area: "Framework", choice: "Next.js 15 (App Router)", note: "React + server components, API routes" },
  { area: "Language", choice: "TypeScript", note: "End-to-end types across the monorepo" },
  { area: "Styling", choice: "Tailwind CSS v4 + shadcn/ui", note: "Design tokens, accessible components" },
  { area: "Monorepo", choice: "pnpm workspaces", note: "apps/web + packages/{shared,db,ai}" },
  { area: "Database", choice: "PostgreSQL (Supabase)", note: "Mumbai region, free tier" },
  { area: "ORM", choice: "Prisma (engine-free client)", note: "queryCompiler + pg adapter (works on ARM64)" },
  { area: "Auth", choice: "Auth.js v5 + Google OAuth", note: "Database sessions via Prisma adapter" },
  { area: "AI", choice: "OpenAI (gpt-image-1)", note: "Behind an adapter in packages/ai" },
  { area: "Queue (planned)", choice: "BullMQ + Upstash Redis", note: "For long generation jobs (Phase 4)" },
  { area: "Payments", choice: "Razorpay (test mode)", note: "Live needs KYC (pre-launch)" },
  { area: "Email (planned)", choice: "Resend", note: "Needs domain verification" },
  { area: "Hosting (planned)", choice: "Vercel + worker host", note: "Domain: printartz.co.in" },
];

const SERVICES: { name: string; purpose: string; status: string }[] = [
  { name: "Supabase", purpose: "Postgres database + object storage (previews/finals)", status: "live" },
  { name: "OpenAI", purpose: "Image generation (and later text guardrails/extraction)", status: "live" },
  { name: "Upstash Redis", purpose: "Job queue backend for the worker", status: "ready" },
  { name: "Google OAuth", purpose: "Sign-in identity provider", status: "live (dev)" },
  { name: "Razorpay", purpose: "Payments for paid generations & downloads", status: "test" },
  { name: "GoDaddy", purpose: "Domain registrar (printartz.co.in)", status: "active" },
  { name: "Resend", purpose: "Transactional email (login, receipts)", status: "pending" },
];

const AUTH_STEPS = [
  "You click “Sign in with Google” — a server action calls Auth.js signIn().",
  "Auth.js redirects you to Google's consent screen (OAuth 2.0).",
  "Google redirects back to /api/auth/callback/google with an authorization code.",
  "Auth.js exchanges the code for your profile and, via the Prisma adapter, creates User + Account + Session rows in Supabase.",
  "A session cookie is set; server components read it with auth() to know who you are.",
];

const DATA_FLOW = [
  { step: "Frontend", detail: "The /create form (client component) collects your instruction + options." },
  { step: "Request", detail: "It POSTs JSON to /api/generate (a Next.js route handler on the Node runtime)." },
  { step: "Auth + validate", detail: "The route checks your session (auth()) and validates input with a shared Zod schema." },
  { step: "Quota + persist", detail: "It checks your free quota, then writes ProjectRequest + GenerationJob rows via Prisma." },
  { step: "AI adapter", detail: "packages/ai builds a print-friendly prompt and calls OpenAI gpt-image-1." },
  { step: "Response", detail: "On success it marks the job SUCCEEDED, increments quota, and returns the image (base64)." },
  { step: "Render", detail: "The frontend shows the preview. Final PDF export + paid download come in later phases." },
];

function Badge({ children }: { children: React.ReactNode }) {
  return (
    <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-medium text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300">
      {children}
    </span>
  );
}

export default function HowItWorks() {
  return (
    <main className="mx-auto max-w-4xl px-6 py-12">
      <Link href="/" className="text-muted-foreground text-sm hover:underline">
        &larr; {SITE.name}
      </Link>

      <h1 className="mt-4 text-4xl font-extrabold tracking-tight">
        How{" "}
        <span className="bg-gradient-to-r from-fuchsia-600 via-violet-600 to-sky-500 bg-clip-text text-transparent">
          {SITE.name}
        </span>{" "}
        works
      </h1>
      <p className="text-muted-foreground mt-3 max-w-2xl">
        A living guide to what powers this site — the tech stack, how login works,
        and how a request travels from the page to the AI and back. Updated as we
        build.
      </p>

      {/* Tech stack */}
      <section className="mt-12">
        <h2 className="text-2xl font-bold">🧱 Tech stack</h2>
        <div className="mt-4 overflow-hidden rounded-xl border">
          <table className="w-full text-sm">
            <thead className="bg-muted/50">
              <tr>
                <th className="px-4 py-2 text-left font-semibold">Area</th>
                <th className="px-4 py-2 text-left font-semibold">Choice</th>
                <th className="hidden px-4 py-2 text-left font-semibold sm:table-cell">Notes</th>
              </tr>
            </thead>
            <tbody>
              {TECH_STACK.map((t) => (
                <tr key={t.area} className="border-t">
                  <td className="px-4 py-2 font-medium">{t.area}</td>
                  <td className="px-4 py-2">{t.choice}</td>
                  <td className="text-muted-foreground hidden px-4 py-2 sm:table-cell">{t.note}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* Auth flow */}
      <section className="mt-12">
        <h2 className="text-2xl font-bold">🔐 How login works</h2>
        <ol className="mt-4 space-y-3">
          {AUTH_STEPS.map((s, i) => (
            <li key={i} className="flex gap-3">
              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-violet-600 text-xs font-bold text-white">
                {i + 1}
              </span>
              <span className="text-sm">{s}</span>
            </li>
          ))}
        </ol>
      </section>

      {/* Data flow */}
      <section className="mt-12">
        <h2 className="text-2xl font-bold">🔄 Data flow: generating an image</h2>
        <div className="mt-4 space-y-2">
          {DATA_FLOW.map((d, i) => (
            <div
              key={d.step}
              className="flex items-start gap-3 rounded-lg border bg-gradient-to-r from-fuchsia-50/50 to-transparent p-3 dark:from-fuchsia-950/20"
            >
              <span className="text-xs font-bold text-fuchsia-600">{i + 1}</span>
              <div>
                <span className="font-semibold">{d.step}</span>
                <span className="text-muted-foreground"> — {d.detail}</span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Services */}
      <section className="mt-12">
        <h2 className="text-2xl font-bold">🧩 Services &amp; how they&apos;re used</h2>
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          {SERVICES.map((s) => (
            <div key={s.name} className="rounded-xl border p-4">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold">{s.name}</h3>
                <Badge>{s.status}</Badge>
              </div>
              <p className="text-muted-foreground mt-1 text-sm">{s.purpose}</p>
            </div>
          ))}
        </div>
      </section>

      <footer className="text-muted-foreground mt-16 border-t pt-6 text-center text-sm">
        {SITE.name} · {SITE.domain} — this page evolves with the project.
      </footer>
    </main>
  );
}
