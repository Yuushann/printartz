"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";

/**
 * Responsive nav container: inline row on >= sm; on mobile it collapses behind a
 * hamburger that opens a dropdown with the same items (fixes nav links being
 * hidden on small screens). Children are rendered once.
 */
export function NavMenu({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const h = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, [open]);

  return (
    <div ref={ref} className="relative flex items-center">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-label="Menu"
        aria-expanded={open}
        className="border-border text-foreground hover:bg-accent inline-flex h-8 w-8 items-center justify-center rounded-full border text-base leading-none transition-colors sm:hidden"
      >
        ☰
      </button>
      <div
        onClick={() => setOpen(false)}
        className={`${open ? "flex" : "hidden"} bg-popover absolute right-0 top-10 z-30 w-48 flex-col items-start gap-1 rounded-xl border p-2 shadow-xl sm:static sm:flex sm:w-auto sm:flex-row sm:items-center sm:gap-4 sm:border-0 sm:bg-transparent sm:p-0 sm:shadow-none`}
      >
        {children}
      </div>
    </div>
  );
}
