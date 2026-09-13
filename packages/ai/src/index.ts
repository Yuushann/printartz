import {
  PROJECT_CATEGORIES,
  STYLES,
  type ProjectRequestInput,
} from "@printartz/shared";

const OPENAI_IMAGES_URL = "https://api.openai.com/v1/images/generations";

export interface GeneratedImage {
  /** Base64-encoded PNG (no data-URI prefix). */
  b64: string;
  model: string;
  prompt: string;
}

/** Turn a structured project request into a print-friendly image prompt. */
export function buildImagePrompt(input: ProjectRequestInput): string {
  const category = PROJECT_CATEGORIES.find((c) => c.id === input.category);
  const style = STYLES.find((s) => s.id === input.style);

  const parts: string[] = [
    `A printable ${category?.label ?? "school project"} image for a young child's school project.`,
    input.instruction.trim(),
  ];

  if (style) parts.push(`Visual style: ${style.label}.`);
  parts.push(
    input.paperColor
      ? `Paper/background colour: ${input.paperColor}.`
      : "Clean plain white background.",
  );

  if (input.category === "coloring") {
    parts.push(
      "Black-and-white line art with bold, clean outlines and no shading, suitable for colouring.",
    );
  } else if (input.category === "cutout") {
    parts.push(
      "Simple, friendly illustration with clear bold outlines suitable for cutting out.",
    );
  } else if (input.category === "labels") {
    parts.push("Decorative label/heading artwork, tidy and legible.");
  }

  parts.push(
    "Child-safe, non-violent, original artwork. No brand logos, no copyrighted characters. Centered composition with clear margins.",
  );

  return parts.join(" ");
}

/**
 * Generate a single image via OpenAI's image model.
 * Provider is intentionally behind this adapter so it can be swapped later.
 */
export async function generateProjectImage(
  input: ProjectRequestInput,
): Promise<GeneratedImage> {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) throw new Error("OPENAI_API_KEY is not configured");

  const model = process.env.AI_IMAGE_MODEL || "gpt-image-1";
  const prompt = buildImagePrompt(input);

  // Portrait fits A4 / chart / half-chart (all portrait-oriented).
  const res = await fetch(OPENAI_IMAGES_URL, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model,
      prompt,
      size: "1024x1536",
      quality: "low", // keep test cost low; raise for final renders later
      n: 1,
    }),
  });

  const json = (await res.json()) as {
    data?: { b64_json?: string }[];
    error?: { message?: string };
  };

  if (!res.ok) {
    throw new Error(json.error?.message ?? `OpenAI image error ${res.status}`);
  }

  const b64 = json.data?.[0]?.b64_json;
  if (!b64) throw new Error("OpenAI returned no image data");

  return { b64, model, prompt };
}
