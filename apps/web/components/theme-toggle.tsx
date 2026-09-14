"use client";

import { useEffect, useRef, useState } from "react";

type Theme = "light" | "dark" | "warm" | "contrast";

const THEMES: { id: Theme; label: string; icon: string }[] = [
  { id: "light", label: "Light", icon: "☀️" },
  { id: "dark", label: "Dark", icon: "🌙" },
  { id: "warm", label: "Warm", icon: "🎨" },
  { id: "contrast", label: "High contrast", icon: "◐" },
];

function applyTheme(t: Theme) {
  const el = document.documentElement;
  el.classList.remove("dark", "theme-warm", "theme-contrast");
  if (t === "dark") el.classList.add("dark");
  else if (t === "warm") el.classList.add("theme-warm");
  else if (t === "contrast") el.classList.add("dark", "theme-contrast");
}

export function ThemeToggle() {
  const [theme, setTheme] = useState<Theme>("dark");
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const stored = localStorage.getItem("theme") as Theme | null;
    if (stored && THEMES.some((t) => t.id === stored)) setTheme(stored);
  }, []);

  useEffect(() => {
    if (!open) return;
    const onClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, [open]);

  const choose = (t: Theme) => {
    setTheme(t);
    applyTheme(t);
    try {
      localStorage.setItem("theme", t);
    } catch {
      /* ignore private-mode storage errors */
    }
    setOpen(false);
  };

  const current = THEMES.find((t) => t.id === theme) ?? THEMES[1];

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-label="Change theme"
        aria-haspopup="menu"
        aria-expanded={open}
        className="border-border text-foreground hover:bg-accent inline-flex h-8 w-8 items-center justify-center rounded-full border text-base leading-none transition-colors"
      >
        {current.icon}
      </button>
      {open && (
        <div
          role="menu"
          className="bg-popover text-popover-foreground absolute right-0 z-30 mt-2 w-44 overflow-hidden rounded-xl border shadow-xl"
        >
          {THEMES.map((t) => (
            <button
              key={t.id}
              type="button"
              role="menuitemradio"
              aria-checked={theme === t.id}
              onClick={() => choose(t.id)}
              className={`hover:bg-accent flex w-full items-center gap-2 px-3 py-2 text-left text-sm transition-colors ${
                theme === t.id ? "font-semibold" : ""
              }`}
            >
              <span className="w-5 text-center">{t.icon}</span>
              {t.label}
              {theme === t.id && <span className="text-primary ml-auto">✓</span>}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
