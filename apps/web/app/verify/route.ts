import { prisma } from "@printartz/db";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// Target of the verification link emailed on signup. Marks the user verified
// then redirects to /login with a status flag.
export async function GET(req: Request) {
  const url = new URL(req.url);
  const origin = url.origin;
  const token = url.searchParams.get("token");

  if (!token) return Response.redirect(`${origin}/login?verify=invalid`);

  const vt = await prisma.verificationToken.findUnique({ where: { token } });
  if (!vt) return Response.redirect(`${origin}/login?verify=invalid`);

  if (vt.expires < new Date()) {
    await prisma.verificationToken.delete({ where: { token } }).catch(() => {});
    return Response.redirect(`${origin}/login?verify=expired`);
  }

  await prisma.user.update({
    where: { email: vt.identifier },
    data: { emailVerified: new Date() },
  });
  await prisma.verificationToken.delete({ where: { token } }).catch(() => {});

  return Response.redirect(`${origin}/login?verified=1`);
}
