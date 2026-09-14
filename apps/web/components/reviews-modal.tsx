"use client";

import { useEffect, useState, useCallback } from "react";
import { Modal } from "@/components/ui/modal";
import { Select } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

type Review = {
  id: string;
  rating: number;
  comment: string | null;
  promptSummary: string | null;
  createdAt: string;
  name: string;
};

function Stars({ n }: { n: number }) {
  return (
    <span className="text-amber-400" aria-label={`${n} out of 5 stars`}>
      {"★".repeat(n)}
      <span className="text-muted-foreground/40">{"★".repeat(5 - n)}</span>
    </span>
  );
}

function istDateTime(iso: string) {
  return new Date(iso).toLocaleString("en-IN", {
    timeZone: "Asia/Kolkata",
    dateStyle: "medium",
    timeStyle: "short",
  });
}

function ReviewItem({ r }: { r: Review }) {
  const [expanded, setExpanded] = useState(false);
  const long = (r.comment?.length ?? 0) > 140;
  return (
    <div className="border-b py-3 last:border-b-0">
      {r.promptSummary && (
        <p className="text-[15px] font-semibold leading-snug">{r.promptSummary}</p>
      )}
      <div className="mt-0.5 flex items-center justify-between gap-2">
        <Stars n={r.rating} />
        <span className="text-muted-foreground text-xs">
          {r.name} · {istDateTime(r.createdAt)} IST
        </span>
      </div>
      {r.comment && (
        <>
          <p className={`text-muted-foreground mt-1 text-sm ${expanded ? "" : "line-clamp-2"}`}>
            {r.comment}
          </p>
          {long && (
            <button
              type="button"
              onClick={() => setExpanded((e) => !e)}
              className="text-primary mt-0.5 text-xs font-medium hover:underline"
            >
              {expanded ? "Show less" : "Read more"}
            </button>
          )}
        </>
      )}
    </div>
  );
}

function StarInput({ value, onChange }: { value: number; onChange: (n: number) => void }) {
  const [hover, setHover] = useState(0);
  return (
    <div className="flex gap-1" onMouseLeave={() => setHover(0)}>
      {[1, 2, 3, 4, 5].map((n) => (
        <button
          key={n}
          type="button"
          aria-label={`${n} star${n > 1 ? "s" : ""}`}
          onMouseEnter={() => setHover(n)}
          onClick={() => onChange(n)}
          className="text-2xl leading-none transition-transform hover:scale-110"
        >
          <span className={(hover || value) >= n ? "text-amber-400" : "text-muted-foreground/40"}>★</span>
        </button>
      ))}
    </div>
  );
}

export function ReviewsButton() {
  const [open, setOpen] = useState(false);
  const [sort, setSort] = useState("newest");
  const [stars, setStars] = useState("0");
  const [reviews, setReviews] = useState<Review[]>([]);
  const [average, setAverage] = useState(0);
  const [count, setCount] = useState(0);
  const [loading, setLoading] = useState(false);

  // Guest (name-only) review form
  const [writing, setWriting] = useState(false);
  const [gName, setGName] = useState("");
  const [gRating, setGRating] = useState(0);
  const [gComment, setGComment] = useState("");
  const [gBusy, setGBusy] = useState(false);
  const [gErr, setGErr] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/reviews?sort=${sort}&stars=${stars}`);
      const data = await res.json();
      if (data.ok) {
        setReviews(data.reviews);
        setAverage(data.average);
        setCount(data.count);
      }
    } catch {
      /* ignore */
    } finally {
      setLoading(false);
    }
  }, [sort, stars]);

  useEffect(() => {
    if (open) load();
  }, [open, load]);

  async function submitGuest() {
    if (gName.trim().length < 1) return setGErr("Please enter your name.");
    if (gRating < 1) return setGErr("Please pick a star rating.");
    setGBusy(true);
    setGErr(null);
    try {
      const res = await fetch("/api/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: gName, rating: gRating, comment: gComment }),
      });
      const data = await res.json();
      if (!res.ok || !data.ok) return setGErr(data.error ?? "Could not submit.");
      setWriting(false);
      setGName("");
      setGRating(0);
      setGComment("");
      await load();
    } catch {
      setGErr("Network error — try again.");
    } finally {
      setGBusy(false);
    }
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="text-muted-foreground hover:text-foreground text-sm font-medium transition-colors"
      >
        Reviews
      </button>
      <Modal open={open} onClose={() => setOpen(false)} title="What parents say ⭐" size="lg">
        <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
          <p className="text-sm">
            {count > 0 ? (
              <>
                <span className="font-bold">{average.toFixed(1)}</span>
                <span className="text-amber-400"> ★</span>{" "}
                <span className="text-muted-foreground">from {count} review{count === 1 ? "" : "s"}</span>
              </>
            ) : (
              <span className="text-muted-foreground">No reviews yet — be the first!</span>
            )}
          </p>
          <div className="flex flex-wrap gap-2">
            <Button size="sm" variant="outline" onClick={() => setWriting((w) => !w)}>
              {writing ? "Close" : "✍️ Write a review"}
            </Button>
            <Select value={sort} onChange={(e) => setSort(e.target.value)} className="h-8 w-auto text-xs">
              <option value="newest">Newest</option>
              <option value="highest">Highest rated</option>
              <option value="lowest">Lowest rated</option>
            </Select>
            <Select value={stars} onChange={(e) => setStars(e.target.value)} className="h-8 w-auto text-xs">
              <option value="0">All stars</option>
              <option value="5">5 ★</option>
              <option value="4">4 ★</option>
              <option value="3">3 ★</option>
              <option value="2">2 ★</option>
              <option value="1">1 ★</option>
            </Select>
          </div>
        </div>

        {writing && (
          <div className="mb-4 rounded-xl border bg-accent/40 p-4">
            <p className="text-sm font-semibold">Leave a quick review</p>
            <input
              value={gName}
              onChange={(e) => setGName(e.target.value)}
              placeholder="Your name"
              className="border-input bg-background mt-2 flex h-9 w-full rounded-md border px-3 text-sm outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50"
            />
            <div className="mt-2">
              <StarInput value={gRating} onChange={setGRating} />
            </div>
            <Textarea
              value={gComment}
              onChange={(e) => setGComment(e.target.value)}
              placeholder="Your review (optional)"
              className="mt-2"
            />
            {gErr && <p className="text-destructive mt-1 text-xs">{gErr}</p>}
            <Button size="sm" className="mt-2" onClick={submitGuest} disabled={gBusy}>
              {gBusy ? "Submitting…" : "Submit review"}
            </Button>
          </div>
        )}

        <div className="max-h-[55vh] overflow-y-auto pr-1">
          {loading ? (
            <p className="text-muted-foreground py-8 text-center text-sm">Loading…</p>
          ) : reviews.length === 0 ? (
            <p className="text-muted-foreground py-8 text-center text-sm">No reviews match this filter.</p>
          ) : (
            reviews.map((r) => <ReviewItem key={r.id} r={r} />)
          )}
        </div>
      </Modal>
    </>
  );
}
