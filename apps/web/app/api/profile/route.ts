import { auth } from "@/auth";
import { prisma } from "@printartz/db";

export const runtime = "nodejs";

export async function PATCH(req: Request) {
  const session = await auth();
  const userId = (session?.user as { id?: string } | undefined)?.id;
  if (!userId) return Response.json({ ok: false, error: "Please sign in first." }, { status: 401 });

  let body: { name?: unknown };
  try {
    body = await req.json();
  } catch {
    return Response.json({ ok: false, error: "Invalid request." }, { status: 400 });
  }

  const name = String(body?.name ?? "").trim();
  if (name.length < 1 || name.length > 80) {
    return Response.json({ ok: false, error: "Please enter a name (1–80 characters)." }, { status: 400 });
  }

  await prisma.user.update({ where: { id: userId }, data: { name } });
  return Response.json({ ok: true, name });
}
