"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

/**
 * Star rating (1-5) + optional comment. Shown only after a signed-in user
 * downloads a result; stored per user via /api/feedback.
 */
export function FeedbackForm({ projectRequestId }: { projectRequestId?: string | null }) {
  const [rating, setRating] = useState(0);
  const [hover, setHover] = useState(0);
  const [comment, setComment] = useState("");
  const [sent, setSent] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (sent) {
    return (
      <div className="rounded-xl border bg-card p-6 text-center">
        <p className="text-2xl">🎉</p>
        <p className="mt-1 font-semibold">Thank you!</p>
        <p className="text-muted-foreground text-sm">Your feedback helps us make PrintArtZ better.</p>
      </div>
    );
  }

  async function submit() {
    if (rating < 1) {
      setError("Please pick a star rating.");
      return;
    }
    setBusy(true);
    setError(null);
    try {
      const res = await fetch("/api/feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ rating, comment, projectRequestId: projectRequestId ?? null }),
      });
      const data = await res.json();
      if (!res.ok || !data.ok) {
        setError(data.error ?? "Could not send feedback.");
        return;
      }
      setSent(true);
    } catch {
      setError("Network error — please try again.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="rounded-xl border bg-card p-5">
      <p className="font-semibold">How did we do? ⭐</p>
      <p className="text-muted-foreground text-sm">You downloaded your sheet — tell us how it went.</p>

      <div className="mt-3 flex gap-1" onMouseLeave={() => setHover(0)}>
        {[1, 2, 3, 4, 5].map((n) => (
          <button
            key={n}
            type="button"
            aria-label={`${n} star${n > 1 ? "s" : ""}`}
            onMouseEnter={() => setHover(n)}
            onClick={() => setRating(n)}
            className="text-3xl leading-none transition-transform hover:scale-110"
          >
            <span className={(hover || rating) >= n ? "text-amber-400" : "text-muted-foreground/40"}>★</span>
          </button>
        ))}
      </div>

      <Textarea
        value={comment}
        onChange={(e) => setComment(e.target.value)}
        placeholder="Anything we could improve? (optional)"
        className="mt-3"
      />

      {error && <p className="text-destructive mt-2 text-sm">{error}</p>}

      <Button
        type="button"
        onClick={submit}
        disabled={busy}
        className="mt-3 bg-gradient-to-r from-fuchsia-600 to-violet-600 text-white hover:from-fuchsia-500 hover:to-violet-500"
      >
        {busy ? "Sending…" : "Send feedback"}
      </Button>
    </div>
  );
}
