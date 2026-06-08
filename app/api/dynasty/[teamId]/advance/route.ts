export const dynamic = "force-dynamic";
import { NextResponse } from "next/server";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/db";
import { generateGameNews, generateRankingsNews, generateInjuryNews, generateDevEventNews } from "@/lib/engine/news-generator";
import { rng } from "@/lib/utils";

// ---------------------------------------------------------------------------
// Quick CPU game simulation (no DB needed, prestige-based)
// ---------------------------------------------------------------------------
function quickSim(homePrestige: number, awayPrestige: number) {
  const homeAdv = 3;
  const diff = homePrestige - awayPrestige + homeAdv;
  const homeBase = 21 + Math.floor(Math.random() * 28);
  const awayBase = 21 + Math.floor(Math.random() * 28);
  const homeScore = Math.max(0, homeBase + Math.floor(diff * 0.8) + Math.floor(Math.random() * 7));
  const awayScore = Math.max(0, awayBase - Math.floor(diff * 0.8) + Math.floor(Math.random() * 7));
  return { homeScore, awayScore };
}

// ---------------------------------------------------------------------------
// Varied headline templates
// ---------------------------------------------------------------------------
const CHEMISTRY_HEADLINES = [
  "LOCKER ROOM VIBE IS RIGHT — THIS TEAM IS LOCKED IN",
  "TEAM CHEMISTRY REPORT: COHESION BUILDING WEEK BY WEEK",
  "SOURCES CLOSE TO PROGRAM: MORALE IS HIGH HEADING INTO THIS STRETCH",
  "THE CULTURE IS REAL — TEAM BONDING PAYING DIVIDENDS IN CAMP",
];

const CHEMISTRY_BODIES = [
  "Multiple players and staff describe the atmosphere as the best in recent memory. Everyone's bought in.",
  "The locker room is tight. When teams gel like this early, it tends to carry through the season.",
  "Practice energy has been electric. Coaches are loving the competitiveness and the accountability between players.",
  "Leadership from the veterans is making the difference. The young guys are learning fast and the older guys are setting the standard.",
];

// ---------------------------------------------------------------------------
// Main handler
// ---------------------------------------------------------------------------
export async function POST(
  _req: Request,
  { params }: { params: Promise<{ teamId: string }> },
) {
  const { teamId } = await params;

  try {
    const dynasty = await prisma.userDynasty.findUnique({ where: { teamId } });
    if (!dynasty) return NextResponse.json({ error: "No dynasty" }, { status: 404 });

    const season = await prisma.season.findUnique({ where: { year: dynasty.currentYear } });
    if (!season) return NextResponse.json({ error: "No season" }, { status: 404 });

    const newWeek = dynasty.currentWeek + 1;

    // ------------------------------------------------------------------
    // 1. Look for the user's game this week
    // ------------------------------------------------------------------
    const userGame = await prisma.game.findFirst({
      where: {
        seasonId: season.id,
        week: newWeek,
        simulated: false,
        OR: [{ homeTeamId: teamId }, { awayTeamId: teamId }],
      },
    });

    if (userGame) {
      // Advance week and send the frontend to the game page
      await prisma.userDynasty.update({ where: { teamId }, data: { currentWeek: newWeek } });
      return NextResponse.json({ success: true, week: newWeek, gameId: userGame.id });
    }

    // ------------------------------------------------------------------
    // 2. Bye / non-game week: batch-read what we need
    // ------------------------------------------------------------------
    const [cpuGames, teamSeason, userTeamData, players] = await Promise.all([
      // All other games this week that haven't been simulated
      prisma.game.findMany({
        where: {
          seasonId: season.id,
          week: newWeek,
          simulated: false,
          AND: [{ homeTeamId: { not: teamId } }, { awayTeamId: { not: teamId } }],
        },
        include: { homeTeam: true, awayTeam: true },
      }),
      prisma.teamSeason.findUnique({
        where: { teamId_seasonId: { teamId, seasonId: season.id } },
      }),
      prisma.team.findUnique({ where: { id: teamId } }),
      // Grab a pool of players for news generation (avoid N+1)
      prisma.player.findMany({
        where: { teamId },
        take: 30,
        orderBy: { overall: "desc" },
      }),
    ]);

    const teamName = userTeamData?.name ?? "Your Team";

    // ------------------------------------------------------------------
    // 3. Simulate CPU games & collect results for news
    // ------------------------------------------------------------------
    type CpuResult = {
      homeTeamName: string;
      awayTeamName: string;
      homeScore: number;
      awayScore: number;
      homeTeamId: string;
      awayTeamId: string;
    };
    const cpuResults: CpuResult[] = [];

    for (const game of cpuGames) {
      const { homeScore, awayScore } = quickSim(
        game.homeTeam.prestige,
        game.awayTeam.prestige,
      );
      cpuResults.push({
        homeTeamName: game.homeTeam.name,
        awayTeamName: game.awayTeam.name,
        homeScore,
        awayScore,
        homeTeamId: game.homeTeamId,
        awayTeamId: game.awayTeamId,
      });

      // Update game record
      await prisma.game.update({
        where: { id: game.id },
        data: { homeScore, awayScore, simulated: true },
      });

      // Update TeamSeason win/loss for both teams
      const homeWon = homeScore > awayScore;

      await prisma.teamSeason.upsert({
        where: { teamId_seasonId: { teamId: game.homeTeamId, seasonId: season.id } },
        update: {
          wins: { increment: homeWon ? 1 : 0 },
          losses: { increment: homeWon ? 0 : 1 },
        },
        create: {
          teamId: game.homeTeamId,
          seasonId: season.id,
          wins: homeWon ? 1 : 0,
          losses: homeWon ? 0 : 1,
        },
      });

      await prisma.teamSeason.upsert({
        where: { teamId_seasonId: { teamId: game.awayTeamId, seasonId: season.id } },
        update: {
          wins: { increment: homeWon ? 0 : 1 },
          losses: { increment: homeWon ? 1 : 0 },
        },
        create: {
          teamId: game.awayTeamId,
          seasonId: season.id,
          wins: homeWon ? 0 : 1,
          losses: homeWon ? 1 : 0,
        },
      });
    }

    // ------------------------------------------------------------------
    // 4. Generate varied news (3-5 items)
    // ------------------------------------------------------------------
    const newsItemsToCreate: Prisma.NewsItemCreateManyInput[] = [];

    // --- Player Development (always try) ---
    if (players.length > 0) {
      const player = players[rng(0, Math.min(players.length - 1, 19))];
      const attrs = ["speed", "strength", "agility", "awareness"] as const;
      const attr = attrs[rng(0, attrs.length - 1)];
      const before = (player[attr] as number | null) ?? 60;
      const gain = rng(1, 4);

      // Create the dev event
      await prisma.playerDevEvent.create({
        data: {
          playerId: player.id,
          seasonId: season.id,
          week: newWeek,
          title: "Development Milestone",
          description: `${player.firstName} ${player.lastName} has shown improvement in ${attr}.`,
          ratingBefore: before,
          ratingAfter: before + gain,
          attribute: attr,
        },
      });

      // Pick a varied headline
      const hIdx = rng(0, 4);
      const fullName = `${player.firstName} ${player.lastName}`;
      const headlines = [
        `${fullName.toUpperCase()} BREAKING OUT IN PRACTICE — STAFF TAKES NOTICE`,
        `${player.year} ${player.position} ${fullName.toUpperCase()} EARNING MORE REPS THIS WEEK`,
        `FILM DON'T LIE: ${fullName.toUpperCase()} PUTTING IN THE WORK`,
        `${fullName.toUpperCase()} (${player.position}) DRAWING RAVE REVIEWS FROM COACHING STAFF`,
        `INSIDE LOOK: ${fullName.toUpperCase()}'S DEVELOPMENT THIS OFFSEASON`,
      ];
      const devNews = generateDevEventNews(fullName, player.position, teamName, attr, before, before + gain);

      newsItemsToCreate.push({
        seasonId: season.id,
        teamId,
        week: newWeek,
        category: "PLAYER_DEVELOPMENT",
        headline: headlines[hIdx] ?? devNews.headline,
        body: devNews.body,
        playerId: player.id,
        isBreaking: devNews.isBreaking,
        isNational: devNews.isNational,
      });
    }

    // --- Recruiting news ---
    if (Math.random() > 0.3) {
      const recruit = await prisma.recruit.findFirst({
        where: { status: "UNCOMMITTED", enrollYear: dynasty.currentYear + 1 },
        skip: rng(0, 50),
        take: 1,
      });
      if (recruit) {
        const recruitName = `${recruit.firstName} ${recruit.lastName}`;
        const hIdx = rng(0, 3);
        const headlines = [
          `RECRUITING: #${recruit.nationalRank} ${recruit.position} ${recruitName.toUpperCase()} HAS YOUR PROGRAM ON HIS LIST`,
          `OFFER EXTENDED: ${recruit.stars}★ ${recruit.position} ${recruitName.toUpperCase()} OUT OF ${recruit.homeState.toUpperCase()}`,
          `${recruitName.toUpperCase()} TAKES OFFICIAL VISIT — SOURCES SAY IT WENT WELL`,
          `COMMITMENT WATCH: ${recruitName.toUpperCase()} NARROWS LIST TO TOP 5`,
        ];
        newsItemsToCreate.push({
          seasonId: season.id,
          teamId,
          week: newWeek,
          category: "RECRUITING",
          headline: headlines[hIdx],
          body: `${recruit.stars}-star ${recruit.position} ${recruitName} out of ${recruit.hometown}, ${recruit.homeState} is drawing interest from programs nationwide. The #${recruit.nationalRank} overall recruit is carefully weighing his options.`,
          isNational: recruit.stars >= 5,
          isBreaking: false,
        });
      }
    }

    // --- Injury (20% chance) ---
    if (Math.random() < 0.2 && players.length > 0) {
      const injuredPlayer = players[rng(0, players.length - 1)];
      const weeksOut = rng(1, 3);
      const injuryNews = generateInjuryNews(
        `${injuredPlayer.firstName} ${injuredPlayer.lastName}`,
        injuredPlayer.position,
        teamName,
        weeksOut,
      );
      await prisma.player.update({
        where: { id: injuredPlayer.id },
        data: { injured: true, injuryWeeks: weeksOut },
      });
      newsItemsToCreate.push({
        seasonId: season.id,
        teamId,
        week: newWeek,
        ...injuryNews,
        playerId: injuredPlayer.id,
      });
    }

    // --- Team chemistry (every 3 weeks) ---
    if (newWeek % 3 === 0) {
      const idx = rng(0, CHEMISTRY_HEADLINES.length - 1);
      newsItemsToCreate.push({
        seasonId: season.id,
        teamId,
        week: newWeek,
        category: "TEAM_CHEMISTRY",
        headline: CHEMISTRY_HEADLINES[idx],
        body: CHEMISTRY_BODIES[idx],
        isBreaking: false,
        isNational: false,
      });
    }

    // --- League results (notable CPU games) ---
    const notableGames = cpuResults
      .filter((r) => Math.abs(r.homeScore - r.awayScore) <= 7 || Math.abs(r.homeScore - r.awayScore) >= 21)
      .slice(0, 3);

    for (const result of notableGames) {
      const homeWon = result.homeScore > result.awayScore;
      const winner = homeWon ? result.homeTeamName : result.awayTeamName;
      const loser = homeWon ? result.awayTeamName : result.homeTeamName;
      const winScore = homeWon ? result.homeScore : result.awayScore;
      const lossScore = homeWon ? result.awayScore : result.homeScore;
      const isUpset = !homeWon; // away win is an upset by default
      const leagueNews = generateGameNews(winner, loser, winScore, lossScore, winner, isUpset);
      newsItemsToCreate.push({
        seasonId: season.id,
        week: newWeek,
        category: leagueNews.category,
        headline: leagueNews.headline,
        body: leagueNews.body,
        isBreaking: leagueNews.isBreaking,
        isNational: true,
      });
    }

    // --- Rankings (every 3 weeks based on actual record) ---
    if (newWeek % 3 === 0 && teamSeason) {
      const wins = teamSeason.wins;
      if (wins >= 2) {
        const apRank = Math.max(1, 30 - wins * 2 - rng(0, 5));
        await prisma.teamSeason.update({
          where: { teamId_seasonId: { teamId, seasonId: season.id } },
          data: { apRank },
        });
        const rankingsNews = generateRankingsNews(teamName, apRank, teamSeason.apRank ?? null);
        newsItemsToCreate.push({
          seasonId: season.id,
          teamId,
          week: newWeek,
          ...rankingsNews,
        });
      }
    }

    // Bulk-insert all news items
    if (newsItemsToCreate.length > 0) {
      await prisma.newsItem.createMany({ data: newsItemsToCreate });
    }

    // ------------------------------------------------------------------
    // 5. Advance week
    // ------------------------------------------------------------------
    await prisma.userDynasty.update({ where: { teamId }, data: { currentWeek: newWeek } });

    return NextResponse.json({ success: true, week: newWeek, gameId: null });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Failed to advance" }, { status: 500 });
  }
}
