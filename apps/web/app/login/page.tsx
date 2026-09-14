"use client";

import { useEffect, useState } from "react";
import { signIn } from "next-auth/react";
import Link from "next/link";
import { SITE } from "@printartz/shared";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";

type Mode = "signin" | "signup";

export default function LoginPage() {
  const [mode, setMode] = useState<Mode>("signin");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    const p = new URLSearchParams(window.location.search);
    if (p.get("verified") === "1") setNotice("Your email is verified — please sign in.");
    else if (p.get("verify") === "expired") setError("That verification link has expired. Please sign up again.");
    else if (p.get("verify") === "invalid") setError("That verification link is invalid.");
  }, []);

  const input =
    "border-input flex h-10 w-full rounded-md border bg-transparent px-3 py-1 text-sm outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50";

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setBusy(true);
    try {
      if (mode === "signup") {
        const res = await fetch("/api/signup", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name, email, password }),
        });
        const data = await res.json();
        if (!res.ok || !data.ok) {
          setError(data.error ?? "Could not create your account.");
          return;
        }
        // If a verification email was sent, don't auto-login — user must verify.
        if (data.verifyEmailSent) {
          setNotice(`We sent a verification link to ${email}. Please verify your email, then sign in.`);
          setMode("signin");
          setPassword("");
          return;
        }
      }
      const result = await signIn("credentials", { email, password, redirect: false });
      if (result?.error) {
        setError(mode === "signup" ? "Account created, but sign-in failed. Try signing in." : "Invalid email or password.");
        return;
      }
      window.location.href = "/create";
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className="mx-auto flex min-h-[80vh] max-w-md flex-col justify-center px-6 py-12">
      <div className="bg-card rounded-2xl border p-8 shadow-xl">
        <h1 className="text-2xl font-bold">
          {mode === "signin" ? "Welcome back" : "Create your account"}
        </h1>
        <p className="text-muted-foreground mt-1 text-sm">
          {mode === "signin"
            ? `Sign in to keep creating with ${SITE.name}.`
            : `Join ${SITE.name} and get free generations to start.`}
        </p>

        <button
          type="button"
          onClick={() => signIn("google", { callbackUrl: "/create" })}
          className="border-border hover:bg-accent mt-6 flex w-full items-center justify-center gap-2 rounded-lg border px-4 py-2.5 text-sm font-semibold transition-colors"
        >
          <span aria-hidden>🇬</span> Continue with Google
        </button>

        <div className="my-5 flex items-center gap-3">
          <span className="bg-border h-px flex-1" />
          <span className="text-muted-foreground text-xs">or with email</span>
          <span className="bg-border h-px flex-1" />
        </div>

        <form onSubmit={onSubmit} className="space-y-4">
          {mode === "signup" && (
            <div className="space-y-1.5">
              <Label htmlFor="name">Name</Label>
              <input id="name" value={name} onChange={(e) => setName(e.target.value)} className={input} placeholder="Your name" autoComplete="name" />
            </div>
          )}
          <div className="space-y-1.5">
            <Label htmlFor="email">Email</Label>
            <input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} className={input} placeholder="you@example.com" autoComplete="email" />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="password">Password</Label>
            <input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} className={input} placeholder="At least 8 characters" autoComplete={mode === "signin" ? "current-password" : "new-password"} />
          </div>

          {notice && <p className="rounded-md bg-emerald-500/10 px-3 py-2 text-sm text-emerald-600 dark:text-emerald-400">{notice}</p>}
          {error && <p className="text-destructive text-sm">{error}</p>}

          <Button
            type="submit"
            disabled={busy}
            className="w-full bg-gradient-to-r from-fuchsia-600 to-violet-600 text-white hover:from-fuchsia-500 hover:to-violet-500"
          >
            {busy ? "Please wait…" : mode === "signin" ? "Sign in" : "Create account"}
          </Button>
        </form>

        <p className="text-muted-foreground mt-5 text-center text-sm">
          {mode === "signin" ? "New here? " : "Already have an account? "}
          <button
            type="button"
            onClick={() => {
              setMode(mode === "signin" ? "signup" : "signin");
              setError(null);
            }}
            className="text-primary font-semibold hover:underline"
          >
            {mode === "signin" ? "Create an account" : "Sign in"}
          </button>
        </p>
      </div>

      <Link href="/" className="text-muted-foreground mt-6 text-center text-sm hover:underline">
        ← Back to {SITE.name}
      </Link>
    </main>
  );
}
