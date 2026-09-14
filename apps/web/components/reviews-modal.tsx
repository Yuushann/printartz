"use client";

import { useEffect, useState, useCallback } from "react";
import { Modal } from "@/components/ui/modal";
import { Select } from "@/components/ui/select";

type Review = { id: string; rating: number; comment: string | null; createdAt: string; name: string };

function Stars({ n }: { n: number }) {
  return (
    <span className="text-amber-400" aria-label={`${n} out of 5 stars`}>
      {"★".repeat(n)}
      <span className="text-muted-foreground/40">{"★".repeat(5 - n)}</span>
    </span>
  );
}

function ReviewItem({ r }: { r: Review }) {
  const [expanded, setExpanded] = useState(false);
  const long = (r.comment?.length ?? 0) > 140;
  return (
    <div className="border-b py-3 last:border-b-0">
      <div className="flex items-center justify-between gap-2">
        <span className="text-sm font-semibold">{r.name}</span>
        <span className="text-muted-foreground text-xs">
          {new Date(r.createdAt).toLocaleDateString()}
        </span>
      </div>
      <Stars n={r.rating} />
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

export function ReviewsButton() {
  const [open, setOpen] = useState(false);
  const [sort, setSort] = useState("newest");
  const [stars, setStars] = useState("0");
  const [reviews, setReviews] = useState<Review[]>([]);
  const [average, setAverage] = useState(0);
  const [count, setCount] = useState(0);
  const [loading, setLoading] = useState(false);

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
          <div className="flex gap-2">
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

        <div className="max-h-[60vh] overflow-y-auto pr-1">
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
