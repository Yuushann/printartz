import { z } from "zod";

/** Site-wide constants. */
export const SITE = {
  name: "PrintArtZ",
  domain: "printartz.co.in",
  tagline: "Accurate, printable school-project images for parents — made in minutes.",
  supportEmail: "support@printartz.co.in",
} as const;

/**
 * Paper presets. All dimensions are stored in MILLIMETRES.
 * Convert to pixels only at export boundaries (per print-accuracy strategy).
 */
export const PAPER_SIZES = {
  a4: { id: "a4", label: "A4", widthMm: 210, heightMm: 297 },
  chart: { id: "chart", label: "Chart paper", widthMm: 559, heightMm: 711 },
  halfChart: { id: "halfChart", label: "Half chart paper", widthMm: 356, heightMm: 559 },
} as const;

export type PaperSizeId = keyof typeof PAPER_SIZES;

/** Initial MVP project categories. */
export const PROJECT_CATEGORIES = [
  { id: "cutout", label: "Cutout sheet", description: "Printable cutouts — animals, fruits, shapes, objects." },
  { id: "coloring", label: "Coloring sheet", description: "Simple black-and-white images for coloring." },
  { id: "chart", label: "Project chart layout", description: "Multiple elements placed on a single chart page." },
  { id: "labels", label: "Labels & headings", description: "Decorative labels, headings and titles." },
] as const;

export type ProjectCategoryId = (typeof PROJECT_CATEGORIES)[number]["id"];

/** Supported visual styles. */
export const STYLES = [
  { id: "realistic", label: "Realistic" },
  { id: "cartoon", label: "Cartoon" },
  { id: "coloring-book", label: "Coloring book" },
  { id: "sketch", label: "Sketch" },
] as const;

export type StyleId = (typeof STYLES)[number]["id"];

/** Free generations before paid usage kicks in. */
export const FREE_GENERATION_QUOTA = 5;

/** Zod schema for a project-generation request (early draft). */
export const projectRequestSchema = z.object({
  instruction: z.string().min(3).max(4000),
  category: z.enum(["cutout", "coloring", "chart", "labels"]),
  paperSize: z.enum(["a4", "chart", "halfChart"]),
  style: z.enum(["realistic", "cartoon", "coloring-book", "sketch"]).optional(),
  paperColor: z.string().optional(),
});

export type ProjectRequestInput = z.infer<typeof projectRequestSchema>;
