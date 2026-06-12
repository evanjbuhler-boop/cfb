export const dynamic = "force-dynamic";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET(_req: Request, { params }: { params: Promise<{ teamId: string }> }) {
  const { teamId } = await params;
  try {
    const dynasty = await prisma.userDynasty.findUnique({ where: { teamId } });
    if (!dynasty) return NextResponse.json({ error: "No dynasty" }, { status: 404 });

    const season = await prisma.season.findUnique({ where: { year: dynasty.currentYear } });
    if (!season) return NextResponse.json({ error: "No season" }, { status: 404 });

    const [games, teamSeason] = await Promise.all([
      prisma.game.findMany({
        where: {
          seasonId: season.id,
          OR: [{ homeTeamId: teamId }, { awayTeamId: teamId }],
        },
        include: {
          homeTeam: { select: { id: true, name: true, abbreviation: true, primaryColor: true, prestige: true } },
          awayTeam: { select: { id: true, name: true, abbreviation: true, primaryColor: true, prestige: true } },
        },
        orderBy: { week: "asc" },
      }),
      prisma.teamSeason.findUnique({
        where: { teamId_seasonId: { teamId, seasonId: season.id } },
      }),
    ]);

    return NextResponse.json({
      games: games.map((g) => ({
        id: g.id,
        week: g.week,
        gameType: g.gameType,
        isHome: g.homeTeamId === teamId,
        homeTeam: g.homeTeam,
        awayTeam: g.awayTeam,
        homeScore: g.homeScore,
        awayScore: g.awayScore,
        simulated: g.simulated,
      })),
      record: { wins: teamSeason?.wins ?? 0, losses: teamSeason?.losses ?? 0 },
      currentWeek: dynasty.currentWeek,
      year: dynasty.currentYear,
    });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Failed to fetch schedule" }, { status: 500 });
  }
}
