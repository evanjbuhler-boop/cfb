export const dynamic = "force-dynamic";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function POST(req: Request) {
  const { teamId } = await req.json();
  if (!teamId) return NextResponse.json({ error: "teamId required" }, { status: 400 });

  try {
    const team = await prisma.team.findUnique({ where: { id: teamId } });
    if (!team) return NextResponse.json({ error: "Team not found" }, { status: 404 });

    const dynasty = await prisma.userDynasty.upsert({
      where: { teamId },
      update: {},
      create: {
        teamId,
        dynastyName: `${team.name} Dynasty`,
        currentYear: 2025,
        currentWeek: 0,
      },
    });

    const season = await prisma.season.upsert({
      where: { year: 2025 },
      update: {},
      create: { year: 2025, currentWeek: 0, phase: "PRESEASON" },
    });

    await prisma.teamSeason.upsert({
      where: { teamId_seasonId: { teamId, seasonId: season.id } },
      update: {},
      create: { teamId, seasonId: season.id },
    });

    // Only generate schedule if no games exist yet for this team/season (idempotent re-start)
    const existingGames = await prisma.game.count({
      where: {
        seasonId: season.id,
        OR: [{ homeTeamId: teamId }, { awayTeamId: teamId }],
      },
    });

    if (existingGames === 0) {
      const userTeam = await prisma.team.findUnique({
        where: { id: teamId },
        include: { conference: true },
      });

      const confOpponents = await prisma.team.findMany({
        where: { conferenceId: userTeam!.conferenceId, id: { not: teamId } },
      });

      const nonConfPool = await prisma.team.findMany({
        where: { conferenceId: { not: userTeam!.conferenceId } },
        orderBy: { prestige: "desc" },
        take: 30,
      });

      // Shuffle non-conf pool for variety
      const shuffledNonConf = [...nonConfPool].sort(() => Math.random() - 0.5);

      const fillerCount = Math.max(0, 12 - confOpponents.length - 2);
      const opponents = [
        ...shuffledNonConf.slice(0, 2),               // 2 non-conf openers
        ...confOpponents,                               // all conf opponents
        ...shuffledNonConf.slice(2, 2 + fillerCount),  // fill to 12
      ].slice(0, 12);

      const gameRows = opponents.map((opp, i) => ({
        seasonId: season.id,
        homeTeamId: i % 2 === 0 ? teamId : opp.id,
        awayTeamId: i % 2 === 0 ? opp.id : teamId,
        week: i + 1,
        gameType: "REGULAR_SEASON",
      }));

      if (gameRows.length > 0) {
        await prisma.game.createMany({ data: gameRows });
      }
    }

    return NextResponse.json({ success: true, dynastyId: dynasty.id });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Failed to start dynasty" }, { status: 500 });
  }
}
