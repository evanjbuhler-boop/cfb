export const dynamic = "force-dynamic";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET(_req: Request, { params }: { params: Promise<{ teamId: string }> }) {
  const { teamId } = await params;
  try {
    const dynasty = await prisma.userDynasty.findUnique({
      where: { teamId },
      include: { team: { include: { conference: true } } },
    });
    if (!dynasty) return NextResponse.json({ error: "No dynasty" }, { status: 404 });

    const season = await prisma.season.findUnique({ where: { year: dynasty.currentYear } });
    if (!season) return NextResponse.json({ error: "No season" }, { status: 404 });

    const [teamSeason, topPlayers, news, committedRecruits] = await Promise.all([
      prisma.teamSeason.findUnique({ where: { teamId_seasonId: { teamId, seasonId: season.id } } }),
      prisma.player.findMany({
        where: { teamId },
        orderBy: { overall: "desc" },
        take: 5,
      }),
      prisma.newsItem.findMany({
        where: { seasonId: season.id, teamId },
        orderBy: { week: "desc" },
        take: 8,
      }),
      prisma.recruit.findMany({
        where: { status: "COMMITTED", committedTeamId: teamId, enrollYear: dynasty.currentYear + 1 },
        orderBy: { stars: "desc" },
        take: 10,
      }),
    ]);

    return NextResponse.json({
      year: dynasty.currentYear,
      team: dynasty.team,
      record: { wins: teamSeason?.wins ?? 0, losses: teamSeason?.losses ?? 0 },
      apRank: teamSeason?.apRank ?? null,
      topPlayers,
      news,
      committedRecruits,
      totalWins: dynasty.totalWins,
      totalLosses: dynasty.totalLosses,
    });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}
