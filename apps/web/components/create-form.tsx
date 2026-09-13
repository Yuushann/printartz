"use client";

import { useState } from "react";
import Image from "next/image";
import { PROJECT_CATEGORIES, PAPER_SIZES, STYLES, type PaperSizeId } from "@printartz/shared";
import { renderPrintPdf } from "@printartz/rendering";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select } from "@/components/ui/select";

const MAX_FILES = 2;

type Ref = { file: File; url: string };

export function CreateForm({ remaining: initialRemaining }: { remaining: number }) {
  const [instruction, setInstruction] = useState("");
  const [category, setCategory] = useState("cutout");
  const [paperSize, setPaperSize] = useState("a4");
  const [style, setStyle] = useState("");
  const [paperColor, setPaperColor] = useState("");
  const [refs, setRefs] = useState<Ref[]>([]);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [image, setImage] = useState<string | null>(null);
  const [summary, setSummary] = useState<string | null>(null);
  const [remaining, setRemaining] = useState(initialRemaining);
  const [refine, setRefine] = useState("");

  function addFiles(list: FileList | null) {
    if (!list) return;
    const incoming = Array.from(list).filter((f) => f.type.startsWith("image/"));
    setRefs((prev) => {
      const room = MAX_FILES - prev.length;
      const added = incoming.slice(0, room).map((file) => ({ file, url: URL.createObjectURL(file) }));
      return [...prev, ...added];
    });
  }
  function removeRef(i: number) {
    setRefs((prev) => {
      URL.revokeObjectURL(prev[i].url);
      return prev.filter((_, k) => k !== i);
    });
  }

  async function runGenerate(instructionText: string, referenceFiles: File[]) {
    setLoading(true);
    setError(null);
    try {
      const fd = new FormData();
      fd.set("instruction", instructionText);
      fd.set("category", category);
      fd.set("paperSize", paperSize);
      if (style) fd.set("style", style);
      if (paperColor) fd.set("paperColor", paperColor);
      referenceFiles.slice(0, MAX_FILES).forEach((f) => fd.append("images", f));

      const res = await fetch("/api/generate", { method: "POST", body: fd });
      const data = await res.json();
      if (!res.ok || !data.ok) {
        setError(data.error ?? "Generation failed.");
        if (typeof data.remaining === "number") setRemaining(data.remaining);
        return false;
      }
      setImage(data.image);
      setSummary(data.summary ?? null);
      setRemaining(data.remaining);
      return true;
    } catch {
      setError("Network error — please try again.");
      return false;
    } finally {
      setLoading(false);
    }
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setImage(null);
    setSummary(null);
    setRefine("");
    if (instruction.trim().length < 3) {
      setError("Please describe the project (at least a few words).");
      return;
    }
    await runGenerate(instruction, refs.map((r) => r.file));
  }

  const [pdfBusy, setPdfBusy] = useState(false);
  async function onDownloadPdf() {
    if (!image) return;
    setPdfBusy(true);
    try {
      const bytes = await (await fetch(image)).arrayBuffer();
      const pdf = await renderPrintPdf({ imageBytes: bytes, paperSizeId: paperSize as PaperSizeId });
      const blob = new Blob([pdf as BlobPart], { type: "application/pdf" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `printartz-${paperSize}.pdf`;
      a.click();
      URL.revokeObjectURL(url);
    } finally {
      setPdfBusy(false);
    }
  }

  async function onRefine() {
    if (!image || refine.trim().length < 2) return;
    // Feed the previous result back as the reference, plus the requested change.
    const prevBlob = await (await fetch(image)).blob();
    const prevFile = new File([prevBlob], "previous.png", { type: "image/png" });
    const combined =
      `${instruction}\n\nThis is a refinement of the attached previous result. ` +
      `Keep it largely the same but apply this change: ${refine.trim()}`;
    const ok = await runGenerate(combined, [prevFile]);
    if (ok) setRefine("");
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
            className="min-h-32"
            placeholder="Paste the full school message here — the messier the better. e.g. 'For the Independence Day activity, make a tricolour kite with the Ashoka Chakra in the centre…'"
          />
        </div>

        {/* Reference images */}
        <div className="space-y-2">
          <Label htmlFor="images">
            Sample image(s) from school <span className="text-muted-foreground font-normal">— optional, up to {MAX_FILES}</span>
          </Label>
          <div className="flex flex-wrap items-center gap-3">
            {refs.map((r, i) => (
              <div key={r.url} className="relative">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={r.url} alt="reference" className="h-20 w-20 rounded-lg border object-cover" />
                <button
                  type="button"
                  onClick={() => removeRef(i)}
                  className="absolute -right-2 -top-2 flex h-6 w-6 items-center justify-center rounded-full bg-destructive text-xs font-bold text-white shadow"
                  aria-label="Remove image"
                >
                  ×
                </button>
              </div>
            ))}
            {refs.length < MAX_FILES && (
              <label className="flex h-20 w-20 cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed text-center text-xs text-muted-foreground hover:bg-black/5 dark:hover:bg-white/5">
                <span className="text-lg">＋</span>
                Add image
                <input
                  id="images"
                  type="file"
                  accept="image/*"
                  multiple
                  className="hidden"
                  onChange={(e) => {
                    addFiles(e.target.files);
                    e.target.value = "";
                  }}
                />
              </label>
            )}
          </div>
          <p className="text-muted-foreground text-xs">
            If the school shared a sample picture, add it — we&apos;ll match it more closely.
          </p>
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
              <div className="flex flex-wrap items-center gap-3">
                <Button
                  type="button"
                  onClick={onDownloadPdf}
                  disabled={pdfBusy}
                  className="bg-gradient-to-r from-emerald-600 to-sky-600 text-white hover:from-emerald-500 hover:to-sky-500"
                >
                  {pdfBusy ? "Preparing…" : `Download print-ready PDF (${PAPER_SIZES[paperSize as PaperSizeId].label}) ↓`}
                </Button>
                <a href={image} download="printartz.png" className="text-muted-foreground text-sm hover:underline">
                  or PNG preview
                </a>
              </div>
              <p className="text-muted-foreground text-xs">
                The PDF page is exactly {PAPER_SIZES[paperSize as PaperSizeId].widthMm}×{PAPER_SIZES[paperSize as PaperSizeId].heightMm} mm. Print at 100% / actual size and check the 100 mm ruler.
              </p>

              {/* Refine loop */}
              <div className="rounded-lg border bg-black/[0.02] p-3 dark:bg-white/[0.03]">
                <Label htmlFor="refine" className="text-sm">Not quite right? Ask for a change</Label>
                <div className="mt-2 flex gap-2">
                  <input
                    id="refine"
                    value={refine}
                    onChange={(e) => setRefine(e.target.value)}
                    disabled={loading || remaining <= 0}
                    placeholder="e.g. make the apples bigger, add 2 more, use green leaves"
                    className="border-input flex h-9 w-full rounded-md border bg-transparent px-3 py-1 text-sm shadow-xs outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50"
                  />
                  <Button type="button" variant="outline" onClick={onRefine} disabled={loading || remaining <= 0 || refine.trim().length < 2}>
                    Regenerate
                  </Button>
                </div>
                <p className="text-muted-foreground mt-2 text-xs">
                  Regenerates using this image as the reference. Uses one generation.
                </p>
              </div>

              <p className="text-muted-foreground text-xs">
                Prototype preview — final print-accurate PDF export, watermarking and paid
                download come in later phases.
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
