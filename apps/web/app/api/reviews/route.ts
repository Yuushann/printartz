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
    createdAt: r.createdAt,
    name: r.user?.name?.split(" ")[0] || "A parent",
  }));

  return Response.json({
    ok: true,
    reviews,
    average: agg._avg.rating ?? 0,
    count: agg._count,
  });
}
