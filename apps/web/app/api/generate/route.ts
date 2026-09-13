import { auth } from "@/auth";
import { prisma } from "@printartz/db";
import {
  planRequest,
  generateImageFromPrompt,
  generateImageWithReferences,
  REJECTION_MESSAGE,
  type ReferenceImage,
} from "@printartz/ai";
import { projectRequestSchema, FREE_GENERATION_QUOTA } from "@printartz/shared";

export const runtime = "nodejs";
export const maxDuration = 90;

const MAX_FILES = 2;
const MAX_FILE_BYTES = 6 * 1024 * 1024; // 6 MB each

export async function POST(req: Request) {
  // 1. Auth gate.
  const session = await auth();
  const userId = (session?.user as { id?: string } | undefined)?.id;
  if (!userId) {
    return Response.json({ ok: false, error: "Please sign in first." }, { status: 401 });
  }

  // 2. Parse multipart form (fields + optional reference images).
  let form: FormData;
  try {
    form = await req.formData();
  } catch {
    return Response.json({ ok: false, error: "Invalid form data." }, { status: 400 });
  }
  const fields = {
    instruction: String(form.get("instruction") ?? ""),
    category: String(form.get("category") ?? ""),
    paperSize: String(form.get("paperSize") ?? ""),
    style: form.get("style") ? String(form.get("style")) : undefined,
    paperColor: form.get("paperColor") ? String(form.get("paperColor")) : undefined,
  };
  const parsed = projectRequestSchema.safeParse(fields);
  if (!parsed.success) {
    return Response.json(
      { ok: false, error: "Invalid request", issues: parsed.error.flatten() },
      { status: 400 },
    );
  }

  // Collect up to 2 image files.
  const refs: ReferenceImage[] = [];
  for (const entry of form.getAll("images")) {
    if (refs.length >= MAX_FILES) break;
    if (typeof entry === "string") continue;
    const file = entry as File;
    if (!file.type.startsWith("image/")) continue;
    if (file.size > MAX_FILE_BYTES) {
      return Response.json({ ok: false, error: "Each image must be under 6 MB." }, { status: 413 });
    }
    refs.push({ data: await file.arrayBuffer(), mime: file.type });
  }

  // 3. Free-quota check.
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { freeGenerationsUsed: true },
  });
  if (!user) return Response.json({ ok: false, error: "User not found." }, { status: 401 });
  if (user.freeGenerationsUsed >= FREE_GENERATION_QUOTA) {
    return Response.json(
      { ok: false, error: "Free generation quota reached. Paid generation is coming soon.", remaining: 0 },
      { status: 402 },
    );
  }

  // 4. Guardrail + prompt planning. Rejections don't cost quota.
  let plan;
  try {
    plan = await planRequest(parsed.data);
  } catch (e) {
    return Response.json(
      { ok: false, error: e instanceof Error ? e.message : "Could not analyze request." },
      { status: 502 },
    );
  }
  if (!plan.allowed || !plan.imagePrompt) {
    await prisma.projectRequest.create({
      data: { userId, ...parsed.data, status: "REJECTED" },
    });
    return Response.json(
      { ok: false, rejected: true, error: plan.rejectionReason || REJECTION_MESSAGE },
      { status: 422 },
    );
  }

  // 5. Persist request + job.
  const projectRequest = await prisma.projectRequest.create({
    data: { userId, ...parsed.data, category: plan.category ?? parsed.data.category, status: "GENERATING" },
  });
  const job = await prisma.generationJob.create({
    data: { projectRequestId: projectRequest.id, status: "RUNNING" },
  });

  // 6. Generate (with references if provided). Charge quota only on success.
  try {
    const image =
      refs.length > 0
        ? await generateImageWithReferences(plan.imagePrompt, refs, { textContent: plan.textContent || undefined })
        : await generateImageFromPrompt(plan.imagePrompt, { textContent: plan.textContent || undefined });

    const updatedUser = await prisma.$transaction(async (tx) => {
      await tx.generationJob.update({ where: { id: job.id }, data: { status: "SUCCEEDED" } });
      await tx.projectRequest.update({ where: { id: projectRequest.id }, data: { status: "GENERATED" } });
      return tx.user.update({
        where: { id: userId },
        data: { freeGenerationsUsed: { increment: 1 } },
        select: { freeGenerationsUsed: true },
      });
    });

    return Response.json({
      ok: true,
      requestId: projectRequest.id,
      image: `data:image/png;base64,${image.b64}`,
      summary: plan.summary || null,
      usedReferences: refs.length,
      remaining: Math.max(0, FREE_GENERATION_QUOTA - updatedUser.freeGenerationsUsed),
    });
  } catch (e) {
    await prisma.generationJob.update({
      where: { id: job.id },
      data: { status: "FAILED", error: e instanceof Error ? e.message : String(e) },
    });
    await prisma.projectRequest.update({ where: { id: projectRequest.id }, data: { status: "FAILED" } });
    return Response.json(
      { ok: false, error: e instanceof Error ? e.message : "Generation failed." },
      { status: 500 },
    );
  }
}
