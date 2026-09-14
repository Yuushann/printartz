"use client";

import Link from "next/link";
import { SITE, FREE_GENERATION_QUOTA } from "@printartz/shared";
import { ModalButton } from "@/components/ui/modal";

const HEADER_BTN =
  "text-muted-foreground hover:text-foreground text-sm font-medium transition-colors";

export function ContactButton() {
  return (
    <ModalButton label="Contact" title="📮 Contact us" className={HEADER_BTN}>
      <p className="text-muted-foreground text-sm">
        Questions, partnerships, or just want to say hi? We&apos;d love to hear from you.
      </p>
      <a
        href={`mailto:${SITE.supportEmail}`}
        className="text-primary mt-4 inline-block font-semibold hover:underline"
      >
        {SITE.supportEmail}
      </a>
    </ModalButton>
  );
}

export function HelpButton() {
  return (
    <ModalButton label="Help" title="❓ Help & FAQ" className={HEADER_BTN}>
      <ul className="text-muted-foreground space-y-3 text-sm">
        <li>
          <span className="text-foreground font-semibold">Is it free?</span> Your first{" "}
          {FREE_GENERATION_QUOTA} generations are on us.
        </li>
        <li>
          <span className="text-foreground font-semibold">What can I print?</span> A4, chart &amp;
          half-chart paper sizes.
        </li>
        <li>
          <span className="text-foreground font-semibold">Do I need an account?</span> Sign in with
          Google or email to start.
        </li>
      </ul>
    </ModalButton>
  );
}

const STEPS = [
  { emoji: "📋", title: "Paste the instruction", text: "Copy whatever your child's school sent — the messier the better." },
  { emoji: "👀", title: "Preview instantly", text: "We generate a print-ready sheet in the size you need, in seconds." },
  { emoji: "🖨️", title: "Print & relax", text: "Download, print at home or a shop, cut, and you're the hero parent." },
];

export function HowItWorksButton({ className }: { className?: string }) {
  return (
    <ModalButton label="How it works" title="How it works" className={className}>
      <p className="text-muted-foreground mb-4 text-sm">Three steps. No craft-store trip required.</p>
      <ol className="space-y-4">
        {STEPS.map((s, i) => (
          <li key={s.title} className="flex gap-3">
            <span className="bg-gradient-to-br from-fuchsia-500 to-violet-500 flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-lg">
              {s.emoji}
            </span>
            <div>
              <h3 className="font-semibold">
                {i + 1}. {s.title}
              </h3>
              <p className="text-muted-foreground text-sm">{s.text}</p>
            </div>
          </li>
        ))}
      </ol>
      <Link
        href="/create"
        className="mt-6 inline-flex w-full items-center justify-center rounded-lg bg-gradient-to-r from-fuchsia-600 to-violet-600 px-4 py-2.5 font-semibold text-white shadow-lg shadow-fuchsia-500/25 transition hover:from-fuchsia-500 hover:to-violet-500"
      >
        Start a project ✨
      </Link>
    </ModalButton>
  );
}
