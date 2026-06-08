import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET(_req: Request, { params }: { params: Promise<{ teamId: string; gameId: string }> }) {
  const { teamId, gameId } = await params;
  try {
    const game = await prisma.game.findUnique({
      where: { id: gameId },
      include: {
        homeTeam: true,
        awayTeam: true,
        drives: { orderBy: { driveNumber: "asc" } },
        playerStats: { include: { player: { include: { traits: true } } } },
      },
    });

    if (!game) return NextResponse.json({ error: "Game not found" }, { status: 404 });

    const isHome = game.homeTeamId === teamId;

    // Find MVP
    let mvpPlayer = null;
    if (game.mvpPlayerId) {
      const mvpStat = game.playerStats.find((s) => s.playerId === game.mvpPlayerId);
      if (mvpStat) mvpPlayer = mvpStat.player;
    }

    return NextResponse.json({
      id: game.id,
      week: game.week,
      gameType: game.gameType,
      homeTeam: game.homeTeam,
      awayTeam: game.awayTeam,
      isHome,
      simulated: game.simulated,
      homeScore: game.homeScore,
      awayScore: game.awayScore,
      headline: game.headline,
      gameNarrative: game.gameNarrative,
      drives: game.drives,
      mvpPlayer,
    });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
