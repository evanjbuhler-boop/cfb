export const dynamic = "force-dynamic";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { generateGameNews, generateRankingsNews } from "@/lib/engine/news-generator";
import { rng } from "@/lib/utils";

export async function POST(_req: Request, { params }: { params: Promise<{ teamId: string }> }) {
  const { teamId } = await params;
  try {
    const dynasty = await prisma.userDynasty.findUnique({ where: { teamId } });
    if (!dynasty) return NextResponse.json({ error: "No dynasty" }, { status: 404 });

    const season = await prisma.season.findUnique({ where: { year: dynasty.currentYear } });
    if (!season) return NextResponse.json({ error: "No season" }, { status: 404 });

    const newWeek = dynasty.currentWeek + 1;

    // Find the user's game this week
    const game = await prisma.game.findFirst({
      where: {
        seasonId: season.id,
        week: newWeek,
        simulated: false,
        OR: [{ homeTeamId: teamId }, { awayTeamId: teamId }],
      },
      include: { homeTeam: true, awayTeam: true },
    });

    let gameId: string | null = null;

    if (game) {
      // Return the game ID so the frontend navigates to game week
      gameId = game.id;
    } else {
      // No game this week — generate news events
      const teamSeason = await prisma.teamSeason.findUnique({
        where: { teamId_seasonId: { teamId, seasonId: season.id } },
      });

      // Random dev event
      if (Math.random() > 0.4) {
        const player = await prisma.player.findFirst({
          where: { teamId },
          skip: rng(0, 20),
          take: 1,
        });
        if (player) {
          const attrs = ["speed","strength","agility","awareness"] as const;
          const attr = attrs[rng(0,attrs.length-1)];
          const before = player[attr] || 60;
          const gain = rng(1,4);
          await prisma.playerDevEvent.create({
            data: {
              playerId: player.id,
              seasonId: season.id,
              week: newWeek,
              title: "Training Camp Breakthrough",
              description: `${player.firstName} ${player.lastName} has shown marked improvement in ${attr}.`,
              ratingBefore: before,
              ratingAfter: before + gain,
              attribute: attr,
            },
          });
          await prisma.newsItem.create({
            data: {
              seasonId: season.id,
              teamId,
              week: newWeek,
              category: "PLAYER_DEVELOPMENT",
              headline: `${player.firstName.toUpperCase()} ${player.lastName.toUpperCase()} TURNING HEADS IN PRACTICE`,
              body: `The coaching staff is raving about ${player.firstName} ${player.lastName}'s work ethic. The ${player.position} is showing marked improvement and pushing for more snaps.`,
              playerId: player.id,
            },
          });
        }
      }

      // Random recruiting news
      if (Math.random() > 0.5) {
        const recruit = await prisma.recruit.findFirst({
          where: { status: "UNCOMMITTED", enrollYear: dynasty.currentYear + 1 },
          skip: rng(0, 50),
          take: 1,
        });
        if (recruit) {
          await prisma.newsItem.create({
            data: {
              seasonId: season.id,
              teamId,
              week: newWeek,
              category: "RECRUITING",
              headline: `RECRUITING: ${recruit.stars}-STAR ${recruit.position} ${recruit.firstName.toUpperCase()} ${recruit.lastName.toUpperCase()} ON THE BOARD`,
              body: `${recruit.stars}-star ${recruit.position} ${recruit.firstName} ${recruit.lastName} out of ${recruit.hometown}, ${recruit.homeState} is drawing interest from programs nationwide. The #${recruit.nationalRank} overall recruit is weighing his options.`,
              isNational: recruit.stars >= 5,
            },
          });
        }
      }

      // Rankings update every 4 weeks
      if (newWeek % 4 === 0 && teamSeason) {
        const wins = teamSeason.wins;
        if (wins >= 2) {
          const apRank = Math.max(1, 30 - wins * 2 - rng(0, 5));
          await prisma.teamSeason.update({
            where: { teamId_seasonId: { teamId, seasonId: season.id } },
            data: { apRank },
          });
          const newsData = generateRankingsNews(
            (await prisma.team.findUnique({ where: { id: teamId } }))?.name || "Your Team",
            apRank,
            teamSeason.apRank || null,
          );
          await prisma.newsItem.create({
            data: { seasonId: season.id, teamId, week: newWeek, ...newsData },
          });
        }
      }
    }

    // Advance week
    await prisma.userDynasty.update({
      where: { teamId },
      data: { currentWeek: newWeek },
    });

    return NextResponse.json({ success: true, week: newWeek, gameId });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Failed to advance" }, { status: 500 });
  }
}
