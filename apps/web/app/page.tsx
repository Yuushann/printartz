/* eslint-disable @next/next/no-img-element */
import Link from "next/link";
import Image from "next/image";
import { SITE, FREE_GENERATION_QUOTA } from "@printartz/shared";
import { buttonVariants } from "@/components/ui/button";
import { HowItWorksButton } from "@/components/info-modals";
import { cn } from "@/lib/utils";

const EXAMPLE_PROMPTS = [
  "6 fruit cutouts for a nursery project 🍎",
  "Coloring sheet of a friendly elephant 🐘",
  "Solar system project chart 🪐",
  "‘My Science Project’ heading banner ✨",
];

// Scattered floating decorations (transparent die-cut stickers).
function Decor() {
  // Balanced on BOTH edges (never center); transform-only animation.
  const items = [
    { src: "/art/crayons.png", cls: "left-[2%] top-[14%] w-16 sm:w-24", rot: "-8deg", delay: "0s" },
    { src: "/art/paint-splash.png", cls: "left-[3%] top-[62%] w-16 sm:w-24", rot: "6deg", delay: "0.8s" },
    { src: "/art/star.png", cls: "right-[3%] top-[10%] w-14 sm:w-20", rot: "10deg", delay: "1.2s" },
    { src: "/art/rainbow.png", cls: "right-[2%] top-[58%] w-20 sm:w-28", rot: "-4deg", delay: "1.8s" },
    { src: "/art/pencil.png", cls: "left-[1%] top-[38%] w-12 sm:w-16", rot: "14deg", delay: "0.4s" },
    // Fox on the right edge: aligned vertically with the star (right-[3%]) and
    // horizontally with the pencil (top-[38%]); kept off the hero text.
    { src: "/art/fox.png", cls: "right-[3%] top-[38%] w-16 sm:w-24", rot: "-6deg", delay: "1.5s" },
  ];
  return (
    <div
      aria-hidden
      className="pointer-events-none absolute inset-0 -z-10 overflow-hidden [contain:layout_paint]"
    >
      {items.map((it) => (
        <img
          key={it.src}
          src={it.src}
          alt=""
          style={{ animationDelay: it.delay, "--rot": it.rot } as React.CSSProperties}
          className={cn("animate-floaty absolute opacity-80", it.cls)}
        />
      ))}
    </div>
  );
}

export default function Home() {
  return (
    <div className="relative overflow-hidden">
      {/* Photographic hero backdrop (free-licensed Pexels image) with a gradient
          overlay that fades into the page background so text stays readable. */}
      <div className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-[720px] overflow-hidden">
        <img
          src="/bg/kids-school-crafts.jpg"
          alt=""
          aria-hidden
          className="h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-background/70 via-background/85 to-background" />
      </div>
      {/* subtle colorful wash behind the rest of the page */}
      <div className="pointer-events-none fixed inset-0 -z-20 bg-gradient-to-b from-fuchsia-50 via-sky-50 to-amber-50 dark:from-fuchsia-950/20 dark:via-sky-950/10 dark:to-amber-950/10" />
      <Decor />

      <main className="mx-auto max-w-6xl px-6">
        {/* Centered brand label (plain, not a link) + tagline */}
        <div className="pt-10 text-center">
          <p className="text-5xl font-extrabold tracking-tight sm:text-6xl">
            <span className="bg-gradient-to-r from-fuchsia-600 via-violet-600 to-sky-500 bg-clip-text text-transparent">
              {SITE.name}
            </span>
          </p>
          <span className="mt-3 inline-block rounded-full bg-gradient-to-r from-fuchsia-500 to-sky-500 px-3 py-1 text-xs font-semibold text-white shadow-sm">
            India-first · {FREE_GENERATION_QUOTA} free generations 🎨
          </span>
        </div>

        {/* Hero */}
        <section className="grid items-center gap-8 py-12 lg:grid-cols-2 lg:py-16">
          <div className="text-center lg:text-left">
            <h1 className="text-4xl font-extrabold tracking-tight sm:text-6xl">
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
              <HowItWorksButton className={cn(buttonVariants({ variant: "outline", size: "lg" }))} />
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
          </div>
        </section>

        {/* Example prompts teaser */}
        <section className="cv-section pb-8">
          <div className="rounded-2xl bg-card border p-6 text-center shadow-sm">
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

        <footer className="text-muted-foreground border-t py-8 text-center text-sm">
          {SITE.name} · {SITE.domain} · {SITE.supportEmail}
        </footer>
      </main>
    </div>
  );
}
