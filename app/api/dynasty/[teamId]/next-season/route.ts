export const dynamic = "force-dynamic";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

const YEAR_ORDER = ["FR", "SO", "JR", "SR", "GR"];

export async function POST(_req: Request, { params }: { params: Promise<{ teamId: string }> }) {
  const { teamId } = await params;
  try {
    const dynasty = await prisma.userDynasty.findUnique({ where: { teamId } });
    if (!dynasty) return NextResponse.json({ error: "No dynasty" }, { status: 404 });

    const newYear = dynasty.currentYear + 1;

    // 1. Advance / graduate players
    const players = await prisma.player.findMany({ where: { teamId } });
    const toGraduate: string[] = [];
    const toAdvance: { id: string; year: string }[] = [];

    for (const p of players) {
      const idx = YEAR_ORDER.indexOf(p.year);
      if (idx === -1 || idx === YEAR_ORDER.length - 1) {
        toGraduate.push(p.id); // GR or unknown → graduate (detach from team)
      } else {
        toAdvance.push({ id: p.id, year: YEAR_ORDER[idx + 1] });
      }
    }

    // Detach graduated players from team (preserve stats history)
    if (toGraduate.length > 0) {
      await prisma.player.updateMany({
        where: { id: { in: toGraduate } },
        data: { teamId: null },
      });
    }

    // Advance years + small overall boost
    for (const p of toAdvance) {
      const boost = p.year === "JR" || p.year === "SO" ? Math.floor(Math.random() * 4) : Math.floor(Math.random() * 2);
      await prisma.player.update({
        where: { id: p.id },
        data: { year: p.year, overall: { increment: boost } },
      });
    }

    // 2. Add committed recruits to roster
    const committed = await prisma.recruit.findMany({
      where: { status: "COMMITTED", committedTeamId: teamId, enrollYear: dynasty.currentYear + 1 },
    });

    if (committed.length > 0) {
      await prisma.player.createMany({
        data: committed.map((r) => ({
          teamId,
          firstName: r.firstName,
          lastName: r.lastName,
          position: r.position,
          year: "FR",
          hometown: r.hometown,
          homeState: r.homeState,
          height: r.height,
          weight: r.weight,
          overall: Math.max(60, r.overallRating - 8), // freshmen come in a bit lower
          speed: r.speedRating,
          strength: Math.floor(50 + Math.random() * 30),
          agility: Math.floor(r.athleticismScore * 0.9),
          awareness: Math.floor(50 + Math.random() * 20),
          potential: r.potential,
          devTrait: r.devTrait,
          recruitStars: r.stars,
          morale: 85,
          leadership: 50,
          character: 75,
          createdAt: new Date(),
          updatedAt: new Date(),
        })),
      });
      // Mark recruits as enrolled
      await prisma.recruit.updateMany({
        where: { id: { in: committed.map((r) => r.id) } },
        data: { status: "ENROLLED" },
      });
    }

    // 3. Create new season + team season
    const newSeason = await prisma.season.upsert({
      where: { year: newYear },
      update: {},
      create: { year: newYear, currentWeek: 0, phase: "PRESEASON" },
    });

    await prisma.teamSeason.upsert({
      where: { teamId_seasonId: { teamId, seasonId: newSeason.id } },
      update: {},
      create: { teamId, seasonId: newSeason.id },
    });

    // 4. Generate new schedule
    const existingGames = await prisma.game.count({
      where: { seasonId: newSeason.id, OR: [{ homeTeamId: teamId }, { awayTeamId: teamId }] },
    });

    if (existingGames === 0) {
      const userTeam = await prisma.team.findUnique({ where: { id: teamId } });
      const confOpponents = await prisma.team.findMany({
        where: { conferenceId: userTeam!.conferenceId, id: { not: teamId } },
      });
      const nonConfPool = await prisma.team.findMany({
        where: { conferenceId: { not: userTeam!.conferenceId } },
        orderBy: { prestige: "desc" },
        take: 30,
      });
      const shuffled = [...nonConfPool].sort(() => Math.random() - 0.5);
      const fillerCount = Math.max(0, 12 - confOpponents.length - 2);
      const opponents = [
        ...shuffled.slice(0, 2),
        ...confOpponents,
        ...shuffled.slice(2, 2 + fillerCount),
      ].slice(0, 12);

      if (opponents.length > 0) {
        await prisma.game.createMany({
          data: opponents.map((opp, i) => ({
            seasonId: newSeason.id,
            homeTeamId: i % 2 === 0 ? teamId : opp.id,
            awayTeamId: i % 2 === 0 ? opp.id : teamId,
            week: i + 1,
            gameType: "REGULAR_SEASON",
          })),
        });
      }
    }

    // 5. Advance dynasty
    await prisma.userDynasty.update({
      where: { teamId },
      data: { currentYear: newYear, currentWeek: 0 },
    });

    return NextResponse.json({ success: true, year: newYear });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Failed to advance season" }, { status: 500 });
  }
}
