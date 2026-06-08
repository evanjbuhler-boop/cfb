import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET(_req: Request, { params }: { params: Promise<{ teamId: string }> }) {
  const { teamId } = await params;
  try {
    const dynasty = await prisma.userDynasty.findUnique({
      where: { teamId },
      include: {
        team: { include: { conference: true } },
      },
    });

    if (!dynasty) return NextResponse.json({ error: "No dynasty found" }, { status: 404 });

    const season = await prisma.season.findUnique({ where: { year: dynasty.currentYear } });
    const teamSeason = season
      ? await prisma.teamSeason.findUnique({ where: { teamId_seasonId: { teamId, seasonId: season.id } } })
      : null;

    // Find upcoming game
    let upcomingGame = null;
    if (season) {
      const next = await prisma.game.findFirst({
        where: {
          seasonId: season.id,
          simulated: false,
          OR: [{ homeTeamId: teamId }, { awayTeamId: teamId }],
          week: { gte: dynasty.currentWeek },
        },
        orderBy: { week: "asc" },
        include: {
          homeTeam: true,
          awayTeam: true,
        },
      });
      if (next) {
        const isHome = next.homeTeamId === teamId;
        const opponent = isHome ? next.awayTeam : next.homeTeam;
        upcomingGame = {
          id: next.id,
          week: next.week,
          gameType: next.gameType,
          isHome,
          opponent: {
            name: opponent.name,
            abbreviation: opponent.abbreviation,
            primaryColor: opponent.primaryColor,
          },
        };
      }
    }

    return NextResponse.json({
      ...dynasty,
      teamSeason,
      upcomingGame,
    });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
