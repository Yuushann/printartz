import { prisma } from "@printartz/db";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const url = new URL(req.url);
  const sort = url.searchParams.get("sort") ?? "newest";
  const stars = Number(url.searchParams.get("stars") ?? "0");

  const where = stars >= 1 && stars <= 5 ? { rating: stars } : {};
  const orderBy =
    sort === "highest"
      ? [{ rating: "desc" as const }, { createdAt: "desc" as const }]
      : sort === "lowest"
        ? [{ rating: "asc" as const }, { createdAt: "desc" as const }]
        : [{ createdAt: "desc" as const }];

  const [rows, agg] = await Promise.all([
    prisma.feedback.findMany({
      where,
      orderBy,
      take: 100,
      select: {
        id: true,
        rating: true,
        comment: true,
        promptSummary: true,
        guestName: true,
        createdAt: true,
        user: { select: { name: true } },
      },
    }),
    prisma.feedback.aggregate({ _avg: { rating: true }, _count: true }),
  ]);

  const reviews = rows.map((r) => ({
    id: r.id,
    rating: r.rating,
    comment: r.comment,
    promptSummary: r.promptSummary,
    createdAt: r.createdAt,
    name: r.user?.name?.split(" ")[0] || r.guestName || "A parent",
  }));

  return Response.json({
    ok: true,
    reviews,
    average: agg._avg.rating ?? 0,
    count: agg._count,
  });
}

// Anonymous site-wide review: name only (NOT a login identity) + rating + comment.
export async function POST(req: Request) {
  let body: { name?: unknown; rating?: unknown; comment?: unknown };
  try {
    body = await req.json();
  } catch {
    return Response.json({ ok: false, error: "Invalid request." }, { status: 400 });
  }

  const name = String(body?.name ?? "").trim().slice(0, 60);
  if (name.length < 1) return Response.json({ ok: false, error: "Please enter your name." }, { status: 400 });

  const rating = Number(body?.rating);
  if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
    return Response.json({ ok: false, error: "Please give a 1–5 star rating." }, { status: 400 });
  }
  const comment = body?.comment ? String(body.comment).trim().slice(0, 2000) || null : null;

  await prisma.feedback.create({ data: { guestName: name, rating, comment } });
  return Response.json({ ok: true });
}
