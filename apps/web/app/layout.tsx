import type { Metadata } from "next";
import { SITE } from "@printartz/shared";
import { SiteHeader } from "@/components/site-header";
import { ScrollMotionGuard } from "@/components/scroll-motion-guard";
import "./globals.css";

export const metadata: Metadata = {
  title: `${SITE.name} — Printable school-project images`,
  description: SITE.tagline,
};

// Runs before paint: applies the saved theme (default = dark) so there's no
// flash of the wrong theme on load.
const themeInit = `(function(){try{var t=localStorage.getItem('theme')||'dark';var el=document.documentElement;el.classList.remove('dark','theme-warm','theme-contrast');if(t==='dark'){el.classList.add('dark');}else if(t==='warm'){el.classList.add('theme-warm');}else if(t==='contrast'){el.classList.add('dark','theme-contrast');}}catch(e){document.documentElement.classList.add('dark');}})();`;

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeInit }} />
      </head>
      <body className="min-h-screen antialiased">
        <ScrollMotionGuard />
        <SiteHeader />
        {children}
      </body>
    </html>
  );
}
