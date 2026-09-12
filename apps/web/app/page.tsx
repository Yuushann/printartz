import Link from "next/link";
import {
  SITE,
  PROJECT_CATEGORIES,
  PAPER_SIZES,
  STYLES,
  FREE_GENERATION_QUOTA,
} from "@printartz/shared";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

// Vivid per-category theming for an art-first feel.
const CATEGORY_STYLES: Record<
  string,
  { card: string; badge: string; ring: string }
> = {
  cutout: {
    card: "from-fuchsia-50 to-pink-50 dark:from-fuchsia-950/40 dark:to-pink-950/30",
    badge: "bg-fuchsia-500",
    ring: "hover:ring-fuchsia-400/60",
  },
  coloring: {
    card: "from-sky-50 to-cyan-50 dark:from-sky-950/40 dark:to-cyan-950/30",
    badge: "bg-sky-500",
    ring: "hover:ring-sky-400/60",
  },
  chart: {
    card: "from-emerald-50 to-lime-50 dark:from-emerald-950/40 dark:to-lime-950/30",
    badge: "bg-emerald-500",
    ring: "hover:ring-emerald-400/60",
  },
  labels: {
    card: "from-amber-50 to-orange-50 dark:from-amber-950/40 dark:to-orange-950/30",
    badge: "bg-amber-500",
    ring: "hover:ring-amber-400/60",
  },
};

const STYLE_PILLS = [
  "bg-fuchsia-100 text-fuchsia-700 dark:bg-fuchsia-950/50 dark:text-fuchsia-300",
  "bg-sky-100 text-sky-700 dark:bg-sky-950/50 dark:text-sky-300",
  "bg-emerald-100 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300",
  "bg-amber-100 text-amber-700 dark:bg-amber-950/50 dark:text-amber-300",
];

export default function Home() {
  return (
    <div className="relative overflow-hidden">
      {/* colorful backdrop blobs */}
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute -top-24 -left-24 h-72 w-72 rounded-full bg-fuchsia-400/30 blur-3xl" />
        <div className="absolute top-10 right-0 h-72 w-72 rounded-full bg-sky-400/30 blur-3xl" />
        <div className="absolute top-96 left-1/3 h-72 w-72 rounded-full bg-amber-300/30 blur-3xl" />
      </div>

      <main className="mx-auto max-w-5xl px-6 py-16">
        {/* Hero */}
        <section className="text-center">
          <span className="inline-block rounded-full bg-gradient-to-r from-fuchsia-500 to-sky-500 px-3 py-1 text-xs font-semibold text-white shadow-sm">
            India-first · {FREE_GENERATION_QUOTA} free generations 🎨
          </span>
          <h1 className="mt-6 text-5xl font-extrabold tracking-tight sm:text-7xl">
            <span className="bg-gradient-to-r from-fuchsia-600 via-violet-600 to-sky-500 bg-clip-text text-transparent">
              {SITE.name}
            </span>
            <span className="text-muted-foreground text-3xl sm:text-4xl">.co.in</span>
          </h1>
          <p className="text-muted-foreground mx-auto mt-5 max-w-2xl text-lg">
            {SITE.tagline}
          </p>
          <div className="mt-8 flex items-center justify-center gap-3">
            <Link
              href="/create"
              className={cn(
                buttonVariants({ size: "lg" }),
                "bg-gradient-to-r from-fuchsia-600 to-violet-600 text-white shadow-lg shadow-fuchsia-500/25 hover:from-fuchsia-500 hover:to-violet-500",
              )}
            >
              Start a project ✨
            </Link>
            <Link
              href="#categories"
              className={cn(buttonVariants({ variant: "outline", size: "lg" }))}
            >
              See what you can make
            </Link>
          </div>
        </section>

        {/* Categories */}
        <section id="categories" className="mt-24">
          <h2 className="text-center text-3xl font-bold">
            What you can{" "}
            <span className="bg-gradient-to-r from-emerald-500 to-sky-500 bg-clip-text text-transparent">
              create
            </span>
          </h2>
          <div className="mt-10 grid gap-5 sm:grid-cols-2">
            {PROJECT_CATEGORIES.map((c) => {
              const s = CATEGORY_STYLES[c.id];
              return (
                <div
                  key={c.id}
                  className={cn(
                    "rounded-2xl border border-black/5 bg-gradient-to-br p-6 shadow-sm ring-2 ring-transparent transition-all dark:border-white/10",
                    s?.card,
                    s?.ring,
                  )}
                >
                  <span
                    className={cn(
                      "inline-block h-3 w-3 rounded-full",
                      s?.badge,
                    )}
                  />
                  <h3 className="mt-3 text-lg font-bold">{c.label}</h3>
                  <p className="text-muted-foreground mt-1 text-sm">
                    {c.description}
                  </p>
                </div>
              );
            })}
          </div>
        </section>

        {/* Paper sizes + styles */}
        <section className="mt-20 grid gap-10 sm:grid-cols-2">
          <div className="rounded-2xl border border-black/5 p-6 dark:border-white/10">
            <h2 className="text-lg font-bold">📐 Print-accurate paper sizes</h2>
            <ul className="text-muted-foreground mt-4 space-y-3 text-sm">
              {Object.values(PAPER_SIZES).map((p) => (
                <li
                  key={p.id}
                  className="flex justify-between border-b border-black/5 pb-2 dark:border-white/10"
                >
                  <span className="text-foreground font-medium">{p.label}</span>
                  <span className="tabular-nums">
                    {p.widthMm} &times; {p.heightMm} mm
                  </span>
                </li>
              ))}
            </ul>
          </div>
          <div className="rounded-2xl border border-black/5 p-6 dark:border-white/10">
            <h2 className="text-lg font-bold">🖌️ Visual styles</h2>
            <div className="mt-4 flex flex-wrap gap-2">
              {STYLES.map((s, i) => (
                <span
                  key={s.id}
                  className={cn(
                    "rounded-full px-3 py-1 text-sm font-medium",
                    STYLE_PILLS[i % STYLE_PILLS.length],
                  )}
                >
                  {s.label}
                </span>
              ))}
            </div>
          </div>
        </section>

        <footer className="text-muted-foreground mt-24 border-t border-black/5 pt-6 text-center text-sm dark:border-white/10">
          {SITE.name} · {SITE.domain} · {SITE.supportEmail}
        </footer>
      </main>
    </div>
  );
}
