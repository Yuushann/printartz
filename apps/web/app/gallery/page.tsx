import Link from "next/link";
import Image from "next/image";
import type { Metadata } from "next";
import { SITE } from "@printartz/shared";
import { buttonVariants } from "@/components/ui/button";
import { PageBackdrop } from "@/components/page-backdrop";
import { cn } from "@/lib/utils";

export const metadata: Metadata = {
  title: `See what you can make — ${SITE.name}`,
  description: "Real example prompts and the printable images PrintArtZ generates.",
};

const EXAMPLES = [
  { src: "/examples/cutout-cartoon.png", category: "Cutout sheet", style: "Cartoon", prompt: "Six friendly cartoon apples as a cutout sheet, bold outlines for cutting." },
  { src: "/examples/cutout-realistic.png", category: "Cutout sheet", style: "Realistic", prompt: "A set of realistic autumn leaves as a cutout sheet." },
  { src: "/examples/coloring-book.png", category: "Coloring sheet", style: "Coloring book", prompt: "A coloring sheet of a smiling elephant, bold black-and-white outlines." },
  { src: "/examples/coloring-sketch.png", category: "Coloring sheet", style: "Sketch", prompt: "A sketch-style rocket and planets coloring page." },
  { src: "/examples/chart-realistic.png", category: "Project chart", style: "Realistic", prompt: "A 'Solar System' school project chart with blank label lines." },
  { src: "/examples/labels-cartoon.png", category: "Labels & headings", style: "Cartoon", prompt: "A colorful 'My Science Project' heading banner with name-tag labels." },
];

const STYLE_COLORS: Record<string, string> = {
  Cartoon: "bg-fuchsia-100 text-fuchsia-700 dark:bg-fuchsia-950/40 dark:text-fuchsia-300",
  Realistic: "bg-emerald-100 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300",
  "Coloring book": "bg-sky-100 text-sky-700 dark:bg-sky-950/40 dark:text-sky-300",
  Sketch: "bg-amber-100 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300",
};

export default function Gallery() {
  return (
    <>
    <PageBackdrop src="/bg/kids-artwork.jpg" />
    <main className="mx-auto max-w-6xl px-6 py-12">
      <div className="text-center">
        <h1 className="text-4xl font-extrabold tracking-tight">
          See what you can{" "}
          <span className="bg-gradient-to-r from-fuchsia-600 via-violet-600 to-sky-500 bg-clip-text text-transparent">
            make
          </span>
        </h1>
        <p className="text-muted-foreground mx-auto mt-3 max-w-2xl">
          Real prompts, real results. Type a plain instruction, pick a style — here&apos;s
          the kind of printable your child gets.
        </p>
      </div>

      <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {EXAMPLES.map((e) => (
          <div key={e.src} className="overflow-hidden rounded-2xl border bg-white/85 shadow-sm dark:bg-white/5">
            <div className="bg-gradient-to-br from-slate-50 to-slate-100 p-3 dark:from-slate-900 dark:to-slate-800">
              <Image
                src={e.src}
                alt={e.prompt}
                width={512}
                height={512}
                unoptimized
                className="mx-auto h-56 w-auto rounded-lg object-contain"
              />
            </div>
            <div className="p-4">
              <div className="flex items-center gap-2">
                <span className="rounded-full bg-black/5 px-2 py-0.5 text-xs font-medium dark:bg-white/10">
                  {e.category}
                </span>
                <span className={cn("rounded-full px-2 py-0.5 text-xs font-medium", STYLE_COLORS[e.style])}>
                  {e.style}
                </span>
              </div>
              <p className="text-muted-foreground mt-2 text-sm">
                <span className="text-foreground font-medium">Prompt:</span> “{e.prompt}”
              </p>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-12 text-center">
        <Link
          href="/create"
          className={cn(
            buttonVariants({ size: "lg" }),
            "bg-gradient-to-r from-fuchsia-600 to-violet-600 text-white hover:from-fuchsia-500 hover:to-violet-500",
          )}
        >
          Make your own ✨
        </Link>
      </div>
    </main>
    </>
  );
}
