"use client";

import { useEffect, useState } from "react";

type Theme = "light" | "dark";

/** Small header toggle: flips between pure-dark (default) and light, persisted
 *  in localStorage. The no-flash initial class is set by an inline script in
 *  the root layout before paint, so this only mirrors + updates that state. */
export function ThemeToggle() {
  const [theme, setTheme] = useState<Theme>("dark");

  useEffect(() => {
    const stored = localStorage.getItem("theme") as Theme | null;
    setTheme(stored ?? (document.documentElement.classList.contains("dark") ? "dark" : "light"));
  }, []);

  const toggle = () => {
    const next: Theme = theme === "dark" ? "light" : "dark";
    setTheme(next);
    document.documentElement.classList.toggle("dark", next === "dark");
    try {
      localStorage.setItem("theme", next);
    } catch {
      /* ignore private-mode storage errors */
    }
  };

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
      title={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
      className="border-border text-foreground hover:bg-accent inline-flex h-8 w-8 items-center justify-center rounded-full border text-base leading-none transition-colors"
    >
      {theme === "dark" ? "☀️" : "🌙"}
    </button>
  );
}
