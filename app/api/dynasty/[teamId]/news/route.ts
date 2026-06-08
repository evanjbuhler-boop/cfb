export const dynamic = "force-dynamic";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET(_req: Request, { params }: { params: Promise<{ teamId: string }> }) {
  const { teamId } = await params;
  try {
    const dynasty = await prisma.userDynasty.findUnique({ where: { teamId } });
    if (!dynasty) return NextResponse.json([]);

    const season = await prisma.season.findUnique({ where: { year: dynasty.currentYear } });
    if (!season) return NextResponse.json([]);

    const news = await prisma.newsItem.findMany({
      where: {
        seasonId: season.id,
        OR: [{ teamId }, { isNational: true }],
        week: { lte: dynasty.currentWeek },
      },
      include: { player: { select: { id: true, firstName: true, lastName: true, position: true } } },
      orderBy: [{ isBreaking: "desc" }, { week: "desc" }, { createdAt: "desc" }],
      take: 30,
    });

    return NextResponse.json(news);
  } catch (err) {
    console.error(err);
    return NextResponse.json([]);
  }
}
