"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

export function FeedbackForm() {
  const [message, setMessage] = useState("");
  const [sent, setSent] = useState(false);

  if (sent) {
    return (
      <div className="rounded-xl bg-white/80 p-6 text-center dark:bg-white/10">
        <p className="text-2xl">🎉</p>
        <p className="mt-1 font-semibold">Thank you!</p>
        <p className="text-muted-foreground text-sm">
          Your feedback helps us make PrintArtZ better.
        </p>
      </div>
    );
  }

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        if (message.trim().length < 2) return;
        // TODO: persist feedback (Phase: send to DB / email via Resend).
        setSent(true);
      }}
      className="space-y-3"
    >
      <Textarea
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        placeholder="What would make PrintArtZ more useful for you?"
        className="bg-white/80 dark:bg-white/10"
      />
      <div className="text-center">
        <Button
          type="submit"
          className="bg-gradient-to-r from-fuchsia-600 to-violet-600 text-white hover:from-fuchsia-500 hover:to-violet-500"
        >
          Send feedback
        </Button>
      </div>
    </form>
  );
}
