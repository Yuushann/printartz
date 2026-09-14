import { prisma } from "@printartz/db";
import bcrypt from "bcryptjs";

export const runtime = "nodejs";

const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function POST(req: Request) {
  let body: { name?: string; email?: string; password?: string };
  try {
    body = await req.json();
  } catch {
    return Response.json({ ok: false, error: "Invalid request." }, { status: 400 });
  }

  const name = String(body?.name ?? "").trim();
  const email = String(body?.email ?? "").trim().toLowerCase();
  const password = String(body?.password ?? "");

  if (name.length < 1) return Response.json({ ok: false, error: "Please enter your name." }, { status: 400 });
  if (!emailRe.test(email)) return Response.json({ ok: false, error: "Please enter a valid email address." }, { status: 400 });
  if (password.length < 8) return Response.json({ ok: false, error: "Password must be at least 8 characters." }, { status: 400 });

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    return Response.json(
      { ok: false, error: "An account with this email already exists. Try signing in." },
      { status: 409 },
    );
  }

  const passwordHash = await bcrypt.hash(password, 10);
  await prisma.user.create({ data: { name, email, passwordHash } });
  return Response.json({ ok: true });
}
