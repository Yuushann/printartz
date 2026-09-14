import { auth } from "@/auth";
import { prisma } from "@printartz/db";

export const runtime = "nodejs";

export async function POST(req: Request) {
  const session = await auth();
  const userId = (session?.user as { id?: string } | undefined)?.id;
  if (!userId) return Response.json({ ok: false, error: "Please sign in first." }, { status: 401 });

  let body: { rating?: unknown; comment?: unknown; projectRequestId?: unknown; promptSummary?: unknown };
  try {
    body = await req.json();
  } catch {
    return Response.json({ ok: false, error: "Invalid request." }, { status: 400 });
  }

  const rating = Number(body?.rating);
  if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
    return Response.json({ ok: false, error: "Please give a 1–5 star rating." }, { status: 400 });
  }
  const comment = body?.comment ? String(body.comment).trim().slice(0, 2000) || null : null;
  const promptSummary = body?.promptSummary ? String(body.promptSummary).trim().slice(0, 300) || null : null;

  // Only link the request if it exists and belongs to this user (avoids FK errors).
  let projectRequestId: string | null = null;
  if (body?.projectRequestId) {
    const owned = await prisma.projectRequest.findFirst({
      where: { id: String(body.projectRequestId), userId },
      select: { id: true },
    });
    projectRequestId = owned?.id ?? null;
  }

  // Keep only the latest review per (user, generation): update if one exists.
  if (projectRequestId) {
    const existing = await prisma.feedback.findFirst({
      where: { userId, projectRequestId },
      select: { id: true },
    });
    if (existing) {
      await prisma.feedback.update({
        where: { id: existing.id },
        data: { rating, comment, promptSummary },
      });
      return Response.json({ ok: true });
    }
  }

  await prisma.feedback.create({ data: { userId, rating, comment, promptSummary, projectRequestId } });
  return Response.json({ ok: true });
}
