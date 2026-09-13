"use client";

import { useState } from "react";
import Image from "next/image";
import {
  PROJECT_CATEGORIES,
  PAPER_SIZES,
  STYLES,
} from "@printartz/shared";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select } from "@/components/ui/select";

export function CreateForm({ remaining: initialRemaining }: { remaining: number }) {
  const [instruction, setInstruction] = useState("");
  const [category, setCategory] = useState("cutout");
  const [paperSize, setPaperSize] = useState("a4");
  const [style, setStyle] = useState("");
  const [paperColor, setPaperColor] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [image, setImage] = useState<string | null>(null);
  const [summary, setSummary] = useState<string | null>(null);
  const [remaining, setRemaining] = useState(initialRemaining);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setImage(null);
    setSummary(null);
    if (instruction.trim().length < 3) {
      setError("Please describe the project (at least a few words).");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          instruction,
          category,
          paperSize,
          style: style || undefined,
          paperColor: paperColor || undefined,
        }),
      });
      const data = await res.json();
      if (!res.ok || !data.ok) {
        setError(data.error ?? "Generation failed.");
        if (typeof data.remaining === "number") setRemaining(data.remaining);
        return;
      }
      setImage(data.image);
      setSummary(data.summary ?? null);
      setRemaining(data.remaining);
    } catch {
      setError("Network error — please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="grid gap-8 lg:grid-cols-2">
      {/* Form */}
      <form onSubmit={onSubmit} className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="instruction">School instruction</Label>
          <Textarea
            id="instruction"
            value={instruction}
            onChange={(e) => setInstruction(e.target.value)}
            placeholder="e.g. Make an A4 sheet with 6 fruit cutouts for a nursery project, cartoon style."
          />
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="category">Category</Label>
            <Select id="category" value={category} onChange={(e) => setCategory(e.target.value)}>
              {PROJECT_CATEGORIES.map((c) => (
                <option key={c.id} value={c.id}>{c.label}</option>
              ))}
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="paperSize">Paper size</Label>
            <Select id="paperSize" value={paperSize} onChange={(e) => setPaperSize(e.target.value)}>
              {Object.values(PAPER_SIZES).map((p) => (
                <option key={p.id} value={p.id}>
                  {p.label} ({p.widthMm}&times;{p.heightMm} mm)
                </option>
              ))}
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="style">Style (optional)</Label>
            <Select id="style" value={style} onChange={(e) => setStyle(e.target.value)}>
              <option value="">No preference</option>
              {STYLES.map((s) => (
                <option key={s.id} value={s.id}>{s.label}</option>
              ))}
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="paperColor">Paper color (optional)</Label>
            <input
              id="paperColor"
              value={paperColor}
              onChange={(e) => setPaperColor(e.target.value)}
              placeholder="e.g. white, light blue"
              className="border-input flex h-9 w-full rounded-md border bg-transparent px-3 py-1 text-sm shadow-xs outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50"
            />
          </div>
        </div>

        <div className="flex items-center gap-4">
          <Button
            type="submit"
            size="lg"
            disabled={loading || remaining <= 0}
            className="bg-gradient-to-r from-fuchsia-600 to-violet-600 text-white hover:from-fuchsia-500 hover:to-violet-500"
          >
            {loading ? "Generating… 🎨" : "Generate image ✨"}
          </Button>
          <span className="text-muted-foreground text-sm">
            {remaining} free generation{remaining === 1 ? "" : "s"} left
          </span>
        </div>

        {error && <p className="text-destructive text-sm">{error}</p>}
      </form>

      {/* Result */}
      <Card className="min-h-80">
        <CardHeader>
          <CardTitle className="text-base">Preview</CardTitle>
        </CardHeader>
        <CardContent>
          {loading && (
            <div className="text-muted-foreground flex h-72 items-center justify-center px-4 text-center text-sm">
              Reading the instruction and drawing your sheet… this can take ~10–20 seconds.
            </div>
          )}
          {!loading && image && (
            <div className="space-y-3">
              {summary && (
                <p className="rounded-md bg-fuchsia-50 px-3 py-2 text-xs text-fuchsia-700 dark:bg-fuchsia-950/40 dark:text-fuchsia-300">
                  <span className="font-semibold">We drew:</span> {summary}
                </p>
              )}
              <Image
                src={image}
                alt="Generated project image"
                width={512}
                height={768}
                unoptimized
                className="w-full rounded-lg border"
              />
              <a
                href={image}
                download="printartz.png"
                className="text-sm font-medium text-fuchsia-600 hover:underline"
              >
                Download prototype image ↓
              </a>
              <p className="text-muted-foreground text-xs">
                Prototype preview — final print-accurate PDF export, watermarking
                and paid download come in later phases.
              </p>
            </div>
          )}
          {!loading && !image && (
            <div className="text-muted-foreground flex h-72 items-center justify-center text-center text-sm">
              Your generated image will appear here.
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
