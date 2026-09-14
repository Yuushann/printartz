"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

/** Home button shown at the far-left of the header on every page EXCEPT the
 *  homepage, so users don't have to reach for the browser back button. */
export function HomeLink() {
  const pathname = usePathname();
  if (pathname === "/") return null;
  return (
    <Link
      href="/"
      className="text-muted-foreground hover:text-foreground hover:bg-accent inline-flex items-center gap-1.5 rounded-full border border-border px-3 py-1.5 text-sm font-medium transition-colors"
    >
      <span aria-hidden>←</span> Home
    </Link>
  );
}
