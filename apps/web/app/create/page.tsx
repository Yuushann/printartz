"use client";

import { useState } from "react";
import Link from "next/link";
import {
  SITE,
  PROJECT_CATEGORIES,
  PAPER_SIZES,
  STYLES,
  projectRequestSchema,
  type ProjectRequestInput,
} from "@printartz/shared";
import { Button, buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select } from "@/components/ui/select";
import { cn } from "@/lib/utils";

type Errors = Partial<Record<keyof ProjectRequestInput, string>>;

export default function CreatePage() {
  const [instruction, setInstruction] = useState("");
  const [category, setCategory] = useState("cutout");
  const [paperSize, setPaperSize] = useState("a4");
  const [style, setStyle] = useState("");
  const [paperColor, setPaperColor] = useState("");
  const [errors, setErrors] = useState<Errors>({});
  const [parsed, setParsed] = useState<ProjectRequestInput | null>(null);

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setParsed(null);
    const result = projectRequestSchema.safeParse({
      instruction,
      category,
      paperSize,
      style: style || undefined,
      paperColor: paperColor || undefined,
    });
    if (!result.success) {
      const fieldErrors: Errors = {};
      for (const issue of result.error.issues) {
        const key = issue.path[0] as keyof ProjectRequestInput;
        if (key && !fieldErrors[key]) fieldErrors[key] = issue.message;
      }
      setErrors(fieldErrors);
      return;
    }
    setErrors({});
    setParsed(result.data);
    // TODO(Phase 3): POST to /api/requests -> guardrail pipeline -> generation.
  }

  return (
    <main className="mx-auto max-w-2xl px-6 py-12">
      <div className="mb-8 flex items-center justify-between">
        <Link href="/" className="text-muted-foreground text-sm hover:underline">
          &larr; {SITE.name}
        </Link>
      </div>

      <h1 className="text-3xl font-bold tracking-tight">Start a project</h1>
      <p className="text-muted-foreground mt-2">
        Paste the school instruction and pick the basics. We&apos;ll handle the print-accurate layout.
      </p>

      <form onSubmit={onSubmit} className="mt-8 space-y-6">
        <div className="space-y-2">
          <Label htmlFor="instruction">School instruction</Label>
          <Textarea
            id="instruction"
            value={instruction}
            onChange={(e) => setInstruction(e.target.value)}
            placeholder="e.g. Make an A4 sheet with 6 fruit cutouts for a nursery project, cartoon style."
          />
          {errors.instruction && (
            <p className="text-destructive text-sm">{errors.instruction}</p>
          )}
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="category">Category</Label>
            <Select
              id="category"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
            >
              {PROJECT_CATEGORIES.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.label}
                </option>
              ))}
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="paperSize">Paper size</Label>
            <Select
              id="paperSize"
              value={paperSize}
              onChange={(e) => setPaperSize(e.target.value)}
            >
              {Object.values(PAPER_SIZES).map((p) => (
                <option key={p.id} value={p.id}>
                  {p.label} ({p.widthMm}&times;{p.heightMm} mm)
                </option>
              ))}
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="style">Style (optional)</Label>
            <Select
              id="style"
              value={style}
              onChange={(e) => setStyle(e.target.value)}
            >
              <option value="">No preference</option>
              {STYLES.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.label}
                </option>
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

        <Button type="submit" size="lg">
          Validate request
        </Button>
      </form>

      {parsed && (
        <Card className="mt-8">
          <CardHeader>
            <CardTitle className="text-base">
              ✓ Valid request (preview of parsed input)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <pre className="bg-muted overflow-x-auto rounded-md p-4 text-xs">
              {JSON.stringify(parsed, null, 2)}
            </pre>
            <p className="text-muted-foreground mt-3 text-sm">
              Next step (Phase 3): this goes through the guardrail pipeline before generation.
            </p>
            <Link
              href="/"
              className={cn(buttonVariants({ variant: "outline", size: "sm" }), "mt-4")}
            >
              Back home
            </Link>
          </CardContent>
        </Card>
      )}
    </main>
  );
}
