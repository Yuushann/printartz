import Link from "next/link";
import {
  SITE,
  PROJECT_CATEGORIES,
  PAPER_SIZES,
  STYLES,
  FREE_GENERATION_QUOTA,
} from "@printartz/shared";
import { Button, buttonVariants } from "@/components/ui/button";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { cn } from "@/lib/utils";

export default function Home() {
  return (
    <main className="mx-auto max-w-5xl px-6 py-16">
      {/* Hero */}
      <section className="text-center">
        <span className="text-muted-foreground inline-block rounded-full border px-3 py-1 text-xs font-medium">
          India-first · {FREE_GENERATION_QUOTA} free generations
        </span>
        <h1 className="mt-6 text-4xl font-bold tracking-tight sm:text-6xl">
          {SITE.name}
          <span className="text-muted-foreground">.co.in</span>
        </h1>
        <p className="text-muted-foreground mx-auto mt-5 max-w-2xl text-lg">
          {SITE.tagline}
        </p>
        <div className="mt-8 flex items-center justify-center gap-3">
          <Link href="/create" className={cn(buttonVariants({ size: "lg" }))}>
            Start a project
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
      <section id="categories" className="mt-20">
        <h2 className="text-center text-2xl font-semibold">What you can create</h2>
        <div className="mt-8 grid gap-4 sm:grid-cols-2">
          {PROJECT_CATEGORIES.map((c) => (
            <Card key={c.id}>
              <CardHeader>
                <CardTitle>{c.label}</CardTitle>
                <CardDescription>{c.description}</CardDescription>
              </CardHeader>
            </Card>
          ))}
        </div>
      </section>

      {/* Paper sizes + styles */}
      <section className="mt-16 grid gap-8 sm:grid-cols-2">
        <div>
          <h2 className="text-lg font-semibold">Print-accurate paper sizes</h2>
          <ul className="text-muted-foreground mt-3 space-y-2 text-sm">
            {Object.values(PAPER_SIZES).map((p) => (
              <li key={p.id} className="flex justify-between border-b pb-2">
                <span className="text-foreground">{p.label}</span>
                <span className="tabular-nums">
                  {p.widthMm} &times; {p.heightMm} mm
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
                className="bg-secondary text-secondary-foreground rounded-full px-3 py-1 text-sm"
              >
                {s.label}
              </span>
            ))}
          </div>
          <div className="mt-6">
            <Button variant="secondary" disabled>
              Sign in (coming soon)
            </Button>
          </div>
        </div>
      </section>

      <footer className="text-muted-foreground mt-24 border-t pt-6 text-center text-sm">
        {SITE.name} · {SITE.domain} · {SITE.supportEmail}
      </footer>
    </main>
  );
}
