export const dynamic = "force-dynamic";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { simulateGame, TeamSnapshot } from "@/lib/engine/game-sim";
import { generateGameNews } from "@/lib/engine/news-generator";
import { clamp } from "@/lib/utils";

export async function POST(req: Request, { params }: { params: Promise<{ teamId: string; gameId: string }> }) {
  const { teamId, gameId } = await params;
  const body = await req.json();
  const motivationChoice: string = body.motivationChoice || "calm";
  const boosts: Record<string, number> = body.boosts || {};

  try {
    const game = await prisma.game.findUnique({
      where: { id: gameId },
      include: {
        homeTeam: { include: { players: { include: { traits: true } } } },
        awayTeam: { include: { players: { include: { traits: true } } } },
        season: true,
      },
    });

    if (!game) return NextResponse.json({ error: "Game not found" }, { status: 404 });
    if (game.simulated) return NextResponse.json({ error: "Already simulated" }, { status: 400 });

    const safeGame = game;
    const isHome = safeGame.homeTeamId === teamId;
    const userBoost = clamp((boosts.offRating || 0) + (boosts.defRating || 0), 0, 15);

    // Build team snapshots
    function buildSnapshot(team: typeof safeGame.homeTeam, isUserTeam: boolean): TeamSnapshot {
      const motivBoost = isUserTeam ? userBoost : 0;
      const avgOff = clamp(
        team.players.reduce((s, p) => s + (p.throwPower || p.ballCarrying || p.runBlocking || 60), 0) / Math.max(team.players.length, 1) + motivBoost,
        50, 99
      );
      const avgDef = clamp(
        team.players.reduce((s, p) => s + (p.tackling || p.coverage || p.blockShedding || 60), 0) / Math.max(team.players.length, 1) + (isUserTeam ? (boosts.defRating || 0) : 0),
        50, 99
      );
      const avgSpd = clamp(
        team.players.reduce((s, p) => s + p.speed, 0) / Math.max(team.players.length, 1),
        50, 99
      );

      return {
        id: team.id,
        name: team.name,
        abbreviation: team.abbreviation,
        primaryColor: team.primaryColor,
        offRating: avgOff,
        defRating: avgDef,
        speedRating: avgSpd,
        players: team.players.map((p) => ({
          id: p.id,
          firstName: p.firstName,
          lastName: p.lastName,
          position: p.position,
          overall: p.overall,
          traits: p.traits.map((t) => t.trait),
          spotlighted: false,
          motivationBoost: isUserTeam ? (boosts.spotlightBoost || 0) : 0,
        })),
      };
    }

    const homeSnap = buildSnapshot(safeGame.homeTeam, isHome);
    const awaySnap = buildSnapshot(safeGame.awayTeam, !isHome);

    const result = simulateGame(homeSnap, awaySnap, {
      homeBoost: isHome ? userBoost : 0,
      awayBoost: !isHome ? userBoost : 0,
    });

    // Persist game result
    await prisma.game.update({
      where: { id: gameId },
      data: {
        simulated: true,
        homeScore: result.homeScore,
        awayScore: result.awayScore,
        overtime: result.overtime,
        motivationChoice,
        motivationBoosts: JSON.stringify(boosts),
        headline: result.headline,
        gameNarrative: result.narrative,
        mvpPlayerId: result.mvpPlayerId,
      },
    });

    // Persist drives (bulk)
    if (result.drives.length > 0) {
      await prisma.gameDrive.createMany({
        data: result.drives.map((drive) => ({
          gameId,
          driveNumber: drive.driveNumber,
          offTeamId: drive.offTeamId,
          startYardLine: drive.startYardLine,
          endYardLine: drive.endYardLine,
          plays: drive.plays,
          yards: drive.yards,
          result: drive.result,
          timeElapsed: drive.timeElapsed,
          quarter: drive.quarter,
          timeStart: drive.timeStart,
          keyPlayerId: drive.keyPlayerId,
          narrative: drive.narrative,
        })),
      });
    }

    // Persist player stats (bulk)
    const statRows = Array.from(result.playerStats.values()).map((statLine) => ({
      gameId,
      playerId: statLine.playerId,
      teamId: statLine.teamId,
      passAttempts: statLine.passAttempts,
      passCompletions: statLine.passCompletions,
      passYards: statLine.passYards,
      passTDs: statLine.passTDs,
      interceptions: statLine.interceptions,
      rushAttempts: statLine.rushAttempts,
      rushYards: statLine.rushYards,
      rushTDs: statLine.rushTDs,
      targets: statLine.targets,
      receptions: statLine.receptions,
      recYards: statLine.recYards,
      recTDs: statLine.recTDs,
      tackles: statLine.tackles,
      sacks: statLine.sacks,
      defInterceptions: statLine.defInterceptions,
      passBreakups: statLine.passBreakups,
      forcedFumbles: statLine.forcedFumbles,
      playerOfGame: statLine.playerOfGame,
    }));
    if (statRows.length > 0) {
      await prisma.playerGameStat.createMany({ data: statRows });
    }

    // Update team season records (user + opponent)
    const userWon = isHome ? result.homeScore > result.awayScore : result.awayScore > result.homeScore;
    const opponentId = isHome ? safeGame.awayTeamId : safeGame.homeTeamId;
    const dynasty = await prisma.userDynasty.findUnique({ where: { teamId } });
    if (dynasty) {
      const season = await prisma.season.findUnique({ where: { year: dynasty.currentYear } });
      if (season) {
        await prisma.teamSeason.upsert({
          where: { teamId_seasonId: { teamId, seasonId: season.id } },
          update: { wins: { increment: userWon ? 1 : 0 }, losses: { increment: userWon ? 0 : 1 } },
          create: { teamId, seasonId: season.id, wins: userWon ? 1 : 0, losses: userWon ? 0 : 1 },
        });
        await prisma.teamSeason.upsert({
          where: { teamId_seasonId: { teamId: opponentId, seasonId: season.id } },
          update: { wins: { increment: userWon ? 0 : 1 }, losses: { increment: userWon ? 1 : 0 } },
          create: { teamId: opponentId, seasonId: season.id, wins: userWon ? 0 : 1, losses: userWon ? 1 : 0 },
        });

        // Generate news
        const mvpPlayer = result.mvpPlayerId
          ? await prisma.player.findUnique({ where: { id: result.mvpPlayerId } })
          : null;

        const newsData = generateGameNews(
          isHome
            ? (result.homeScore > result.awayScore ? safeGame.homeTeam.abbreviation : safeGame.awayTeam.abbreviation)
            : (result.awayScore > result.homeScore ? safeGame.awayTeam.abbreviation : safeGame.homeTeam.abbreviation),
          isHome
            ? (result.homeScore <= result.awayScore ? safeGame.homeTeam.abbreviation : safeGame.awayTeam.abbreviation)
            : (result.awayScore <= result.homeScore ? safeGame.awayTeam.abbreviation : safeGame.homeTeam.abbreviation),
          Math.max(result.homeScore, result.awayScore),
          Math.min(result.homeScore, result.awayScore),
          mvpPlayer ? `${mvpPlayer.firstName} ${mvpPlayer.lastName}` : "The team",
          safeGame.gameType === "RIVALRY",
        );

        await prisma.newsItem.create({
          data: {
            seasonId: season.id,
            teamId,
            week: safeGame.week,
            gameId,
            ...newsData,
            playerId: result.mvpPlayerId,
          },
        });

        await prisma.userDynasty.update({
          where: { teamId },
          data: {
            totalWins: { increment: userWon ? 1 : 0 },
            totalLosses: { increment: userWon ? 0 : 1 },
          },
        });
      }
    }

    // Fetch MVP player for response
    let mvpPlayerData = null;
    if (result.mvpPlayerId) {
      mvpPlayerData = await prisma.player.findUnique({
        where: { id: result.mvpPlayerId },
        include: { traits: true },
      });
    }

    return NextResponse.json({
      success: true,
      homeScore: result.homeScore,
      awayScore: result.awayScore,
      headline: result.headline,
      narrative: result.narrative,
      mvpPlayer: mvpPlayerData,
      userWon,
    });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Simulation failed" }, { status: 500 });
  }
}
