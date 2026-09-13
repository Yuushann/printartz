/* eslint-disable @next/next/no-img-element */
import Link from "next/link";
import Image from "next/image";
import { SITE, FREE_GENERATION_QUOTA } from "@printartz/shared";
import { buttonVariants } from "@/components/ui/button";
import { FeedbackForm } from "@/components/feedback-form";
import { cn } from "@/lib/utils";

const EXAMPLE_PROMPTS = [
  "6 fruit cutouts for a nursery project 🍎",
  "Coloring sheet of a friendly elephant 🐘",
  "Solar system project chart 🪐",
  "‘My Science Project’ heading banner ✨",
];

const STEPS = [
  { emoji: "📋", title: "Paste the instruction", text: "Copy whatever your child's school sent — the messier the better." },
  { emoji: "👀", title: "Preview instantly", text: "We generate a print-ready sheet in the size you need, in seconds." },
  { emoji: "🖨️", title: "Print & relax", text: "Download, print at home or a shop, cut, and you're the hero parent." },
];

// Scattered floating decorations (transparent die-cut stickers).
function Decor() {
  // Kept to the far edges (never center) and lightweight for smooth scrolling.
  const items = [
    { src: "/art/crayons.png", cls: "left-[2%] top-[14%] w-16 sm:w-24", rot: "-8deg", delay: "0s" },
    { src: "/art/star.png", cls: "right-[3%] top-[10%] w-14 sm:w-20", rot: "10deg", delay: "1.2s" },
    { src: "/art/rainbow.png", cls: "right-[2%] top-[58%] w-20 sm:w-28", rot: "-4deg", delay: "1.8s" },
  ];
  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
      {items.map((it) => (
        <img
          key={it.src}
          src={it.src}
          alt=""
          style={{ animationDelay: it.delay, "--rot": it.rot } as React.CSSProperties}
          className={cn("animate-floaty absolute opacity-80 [will-change:transform]", it.cls)}
        />
      ))}
    </div>
  );
}

export default function Home() {
  return (
    <div className="relative overflow-hidden">
      {/* soft colorful wash */}
      <div className="pointer-events-none absolute inset-0 -z-20 bg-gradient-to-b from-fuchsia-50 via-sky-50 to-amber-50 dark:from-fuchsia-950/20 dark:via-sky-950/10 dark:to-amber-950/10" />
      <Decor />

      <main className="mx-auto max-w-6xl px-6">
        {/* Hero */}
        <section className="grid items-center gap-8 py-16 lg:grid-cols-2 lg:py-24">
          <div className="text-center lg:text-left">
            <span className="inline-block rounded-full bg-gradient-to-r from-fuchsia-500 to-sky-500 px-3 py-1 text-xs font-semibold text-white shadow-sm">
              India-first · {FREE_GENERATION_QUOTA} free generations 🎨
            </span>
            <h1 className="mt-5 text-4xl font-extrabold tracking-tight sm:text-6xl">
              School projects,{" "}
              <span className="bg-gradient-to-r from-fuchsia-600 via-violet-600 to-sky-500 bg-clip-text text-transparent">
                minus the panic
              </span>
            </h1>
            <p className="text-muted-foreground mx-auto mt-4 max-w-xl text-lg lg:mx-0">
              {SITE.tagline}
            </p>
            <p className="text-muted-foreground/90 mx-auto mt-3 max-w-xl lg:mx-0">
              Teacher wants a hand-made solar system by tomorrow morning? Breathe. ☕
              Paste whatever the school sent, pick a paper size, and we&apos;ll conjure
              a crisp, print-ready sheet before your chai goes cold.
            </p>
            <div className="mt-8 flex flex-wrap items-center justify-center gap-3 lg:justify-start">
              <Link
                href="/create"
                className={cn(
                  buttonVariants({ size: "lg" }),
                  "bg-gradient-to-r from-fuchsia-600 to-violet-600 text-white shadow-lg shadow-fuchsia-500/25 hover:from-fuchsia-500 hover:to-violet-500",
                )}
              >
                Start a project ✨
              </Link>
              <Link href="/gallery" className={cn(buttonVariants({ variant: "outline", size: "lg" }))}>
                See what you can make →
              </Link>
            </div>
          </div>

          {/* Hero illustration */}
          <div className="relative mx-auto w-full max-w-md">
            <div className="overflow-hidden rounded-3xl bg-gradient-to-br from-amber-100 to-orange-100 p-2 shadow-xl ring-4 ring-white dark:ring-white/10">
              <Image
                src="/art/hero.png"
                alt="A parent and child happily doing a craft project together"
                width={1536}
                height={1024}
                unoptimized
                priority
                className="h-auto w-full rounded-2xl"
              />
            </div>
            <img
              src="/art/fox.png"
              alt=""
              aria-hidden
              className="animate-floaty absolute -right-6 -bottom-6 w-20 [will-change:transform] sm:w-28"
            />
          </div>
        </section>

        {/* Example prompts teaser */}
        <section className="pb-8">
          <div className="rounded-2xl border bg-white/85 p-6 text-center shadow-sm dark:bg-white/5">
            <p className="text-sm font-semibold text-fuchsia-600">Try prompts like…</p>
            <div className="mt-3 flex flex-wrap justify-center gap-2">
              {EXAMPLE_PROMPTS.map((p) => (
                <span key={p} className="rounded-full bg-fuchsia-50 px-3 py-1 text-sm text-fuchsia-700 dark:bg-fuchsia-950/40 dark:text-fuchsia-300">
                  {p}
                </span>
              ))}
            </div>
            <Link href="/gallery" className="mt-4 inline-block text-sm font-semibold text-violet-600 hover:underline">
              See real examples with images →
            </Link>
          </div>
        </section>

        {/* How it works (for parents) */}
        <section className="py-16">
          <h2 className="text-center text-3xl font-bold">
            How it{" "}
            <span className="bg-gradient-to-r from-emerald-500 to-sky-500 bg-clip-text text-transparent">works</span>
          </h2>
          <p className="text-muted-foreground mt-2 text-center">Three steps. No craft-store trip required.</p>
          <div className="mt-10 grid gap-5 sm:grid-cols-3">
            {STEPS.map((s, i) => (
              <div key={s.title} className="relative rounded-2xl border bg-white/85 p-6 text-center shadow-sm dark:bg-white/5">
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-fuchsia-500 to-violet-500 text-2xl">
                  {s.emoji}
                </div>
                <h3 className="mt-3 font-bold">
                  {i + 1}. {s.title}
                </h3>
                <p className="text-muted-foreground mt-1 text-sm">{s.text}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Feedback */}
        <section className="py-12">
          <div className="rounded-3xl bg-gradient-to-br from-fuchsia-100 to-sky-100 p-8 dark:from-fuchsia-950/30 dark:to-sky-950/20">
            <h2 className="text-center text-2xl font-bold">Tell us what you think 💬</h2>
            <p className="text-muted-foreground mx-auto mt-2 max-w-lg text-center text-sm">
              We&apos;re building this for parents like you. What would make it more useful?
            </p>
            <div className="mx-auto mt-6 max-w-lg">
              <FeedbackForm />
            </div>
          </div>
        </section>

        {/* Contact & Help */}
        <section id="help" className="grid gap-6 py-12 sm:grid-cols-2">
          <div className="rounded-2xl border p-6">
            <h2 className="text-lg font-bold">📮 Contact us</h2>
            <p className="text-muted-foreground mt-2 text-sm">
              Questions, partnerships, or just want to say hi?
            </p>
            <a href={`mailto:${SITE.supportEmail}`} className="mt-3 inline-block font-medium text-fuchsia-600 hover:underline">
              {SITE.supportEmail}
            </a>
          </div>
          <div className="rounded-2xl border p-6">
            <h2 className="text-lg font-bold">❓ Help & FAQ</h2>
            <ul className="text-muted-foreground mt-2 space-y-2 text-sm">
              <li><span className="text-foreground font-medium">Is it free?</span> Your first {FREE_GENERATION_QUOTA} generations are on us.</li>
              <li><span className="text-foreground font-medium">What can I print?</span> A4, chart & half-chart paper sizes.</li>
              <li><span className="text-foreground font-medium">Do I need an account?</span> Just sign in with Google to start.</li>
            </ul>
          </div>
        </section>

        <footer className="text-muted-foreground border-t py-8 text-center text-sm">
          {SITE.name} · {SITE.domain} · {SITE.supportEmail}
        </footer>
      </main>
    </div>
  );
}
