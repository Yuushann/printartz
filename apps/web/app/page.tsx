import {
  SITE,
  PROJECT_CATEGORIES,
  PAPER_SIZES,
  STYLES,
  FREE_GENERATION_QUOTA,
} from "@printartz/shared";

export default function Home() {
  return (
    <main className="mx-auto max-w-5xl px-6 py-16">
      {/* Hero */}
      <section className="text-center">
        <span className="inline-block rounded-full border border-black/10 dark:border-white/15 px-3 py-1 text-xs font-medium text-black/60 dark:text-white/60">
          India-first · {FREE_GENERATION_QUOTA} free generations
        </span>
        <h1 className="mt-6 text-4xl font-bold tracking-tight sm:text-6xl">
          {SITE.name}
          <span className="text-black/40 dark:text-white/40">.co.in</span>
        </h1>
        <p className="mx-auto mt-5 max-w-2xl text-lg text-black/70 dark:text-white/70">
          {SITE.tagline}
        </p>
        <div className="mt-8 flex items-center justify-center gap-3">
          <a
            href="#"
            className="rounded-lg bg-foreground px-5 py-3 text-sm font-semibold text-background transition-opacity hover:opacity-90"
          >
            Start a project
          </a>
          <a
            href="#categories"
            className="rounded-lg border border-black/15 dark:border-white/20 px-5 py-3 text-sm font-semibold transition-colors hover:bg-black/5 dark:hover:bg-white/10"
          >
            See what you can make
          </a>
        </div>
      </section>

      {/* Categories */}
      <section id="categories" className="mt-20">
        <h2 className="text-center text-2xl font-semibold">What you can create</h2>
        <div className="mt-8 grid gap-4 sm:grid-cols-2">
          {PROJECT_CATEGORIES.map((c) => (
            <div
              key={c.id}
              className="rounded-xl border border-black/10 dark:border-white/10 p-5"
            >
              <h3 className="font-semibold">{c.label}</h3>
              <p className="mt-1 text-sm text-black/60 dark:text-white/60">
                {c.description}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Paper sizes + styles */}
      <section className="mt-16 grid gap-8 sm:grid-cols-2">
        <div>
          <h2 className="text-lg font-semibold">Print-accurate paper sizes</h2>
          <ul className="mt-3 space-y-2 text-sm text-black/70 dark:text-white/70">
            {Object.values(PAPER_SIZES).map((p) => (
              <li key={p.id} className="flex justify-between border-b border-black/5 dark:border-white/10 pb-2">
                <span>{p.label}</span>
                <span className="tabular-nums text-black/50 dark:text-white/50">
                  {p.widthMm} × {p.heightMm} mm
                </span>
              </li>
            ))}
          </ul>
        </div>
        <div>
          <h2 className="text-lg font-semibold">Visual styles</h2>
          <div className="mt-3 flex flex-wrap gap-2">
            {STYLES.map((s) => (
              <span
                key={s.id}
                className="rounded-full bg-black/5 dark:bg-white/10 px-3 py-1 text-sm"
              >
                {s.label}
              </span>
            ))}
          </div>
        </div>
      </section>

      <footer className="mt-24 border-t border-black/10 dark:border-white/10 pt-6 text-center text-sm text-black/50 dark:text-white/50">
        {SITE.name} · {SITE.domain} · {SITE.supportEmail}
      </footer>
    </main>
  );
}
