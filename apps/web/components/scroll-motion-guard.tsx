"use client";

import { useEffect } from "react";

/**
 * Keeps scrolling smooth even when the browser has hardware acceleration OFF
 * (and in Firefox, which is strict about compositing animated layers).
 *
 * While the user is actively scrolling we set `data-scrolling` on <html>; CSS
 * then pauses the decorative floating animations so they don't compete with the
 * scroll on the main thread. A short idle timeout clears the flag so the
 * animations resume once scrolling stops. Passive listener → no scroll blocking.
 */
export function ScrollMotionGuard() {
  useEffect(() => {
    const root = document.documentElement;
    let timer: number | undefined;

    const onScroll = () => {
      if (root.getAttribute("data-scrolling") !== "true") {
        root.setAttribute("data-scrolling", "true");
      }
      if (timer) window.clearTimeout(timer);
      timer = window.setTimeout(() => {
        root.removeAttribute("data-scrolling");
      }, 150);
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      if (timer) window.clearTimeout(timer);
      root.removeAttribute("data-scrolling");
    };
  }, []);

  return null;
}
