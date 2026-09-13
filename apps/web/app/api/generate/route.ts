import { auth } from "@/auth";
import { prisma } from "@printartz/db";
import { planRequest, generateImageFromPrompt, REJECTION_MESSAGE } from "@printartz/ai";
import { projectRequestSchema, FREE_GENERATION_QUOTA } from "@printartz/shared";

export const runtime = "nodejs";
export const maxDuration = 60;

export async function POST(req: Request) {
  // 1. Auth gate.
  const session = await auth();
  const userId = (session?.user as { id?: string } | undefined)?.id;
  if (!userId) {
    return Response.json({ ok: false, error: "Please sign in first." }, { status: 401 });
  }

  // 2. Validate input shape.
  const body = await req.json().catch(() => null);
  const parsed = projectRequestSchema.safeParse(body);
  if (!parsed.success) {
    return Response.json(
      { ok: false, error: "Invalid request", issues: parsed.error.flatten() },
      { status: 400 },
    );
  }

  // 3. Free-quota check.
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { freeGenerationsUsed: true },
  });
  if (!user) {
    return Response.json({ ok: false, error: "User not found." }, { status: 401 });
  }
  if (user.freeGenerationsUsed >= FREE_GENERATION_QUOTA) {
    return Response.json(
      { ok: false, error: "Free generation quota reached. Paid generation is coming soon.", remaining: 0 },
      { status: 402 },
    );
  }

  // 4. Guardrail + prompt planning (cheap text model). Rejections don't cost quota.
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
      data: {
        userId,
        instruction: parsed.data.instruction,
        category: parsed.data.category,
        paperSize: parsed.data.paperSize,
        style: parsed.data.style,
        paperColor: parsed.data.paperColor,
        status: "REJECTED",
      },
    });
    return Response.json(
      { ok: false, rejected: true, error: plan.rejectionReason || REJECTION_MESSAGE },
      { status: 422 },
    );
  }

  // 5. Persist request + job lifecycle.
  const projectRequest = await prisma.projectRequest.create({
    data: {
      userId,
      instruction: parsed.data.instruction,
      category: plan.category ?? parsed.data.category,
      paperSize: parsed.data.paperSize,
      style: parsed.data.style,
      paperColor: parsed.data.paperColor,
      status: "GENERATING",
    },
  });
  const job = await prisma.generationJob.create({
    data: { projectRequestId: projectRequest.id, status: "RUNNING" },
  });

  // 6. Generate from the clean, planned prompt. Charge quota only on success.
  try {
    const image = await generateImageFromPrompt(plan.imagePrompt, {
      textContent: plan.textContent || undefined,
    });

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
      remaining: Math.max(0, FREE_GENERATION_QUOTA - updatedUser.freeGenerationsUsed),
    });
  } catch (e) {
    await prisma.generationJob.update({
      where: { id: job.id },
      data: { status: "FAILED", error: e instanceof Error ? e.message : String(e) },
    });
    await prisma.projectRequest.update({
      where: { id: projectRequest.id },
      data: { status: "FAILED" },
    });
    return Response.json(
      { ok: false, error: e instanceof Error ? e.message : "Generation failed." },
      { status: 500 },
    );
  }
}
