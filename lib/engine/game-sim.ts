import { rng, weightedRandom, clamp } from "@/lib/utils";

export interface TeamSnapshot {
  id: string;
  name: string;
  abbreviation: string;
  primaryColor: string;
  offRating: number;
  defRating: number;
  speedRating: number;
  players: PlayerSnapshot[];
}

export interface PlayerSnapshot {
  id: string;
  firstName: string;
  lastName: string;
  position: string;
  overall: number;
  traits: string[];
  spotlighted: boolean;
  motivationBoost: number;
}

export interface DriveResult {
  driveNumber: number;
  offTeamId: string;
  startYardLine: number;
  endYardLine: number;
  plays: number;
  yards: number;
  result: string;
  timeElapsed: number;
  quarter: number;
  timeStart: number;
  keyPlayerId: string | null;
  narrative: string;
}

export interface GameResult {
  homeScore: number;
  awayScore: number;
  overtime: boolean;
  drives: DriveResult[];
  playerStats: Map<string, PlayerStatLine>;
  headline: string;
  narrative: string;
  mvpPlayerId: string | null;
}

export interface PlayerStatLine {
  playerId: string;
  teamId: string;
  passAttempts: number;
  passCompletions: number;
  passYards: number;
  passTDs: number;
  interceptions: number;
  rushAttempts: number;
  rushYards: number;
  rushTDs: number;
  targets: number;
  receptions: number;
  recYards: number;
  recTDs: number;
  tackles: number;
  sacks: number;
  defInterceptions: number;
  passBreakups: number;
  forcedFumbles: number;
  playerOfGame: boolean;
}

function emptyStatLine(playerId: string, teamId: string): PlayerStatLine {
  return {
    playerId,
    teamId,
    passAttempts: 0, passCompletions: 0, passYards: 0, passTDs: 0, interceptions: 0,
    rushAttempts: 0, rushYards: 0, rushTDs: 0,
    targets: 0, receptions: 0, recYards: 0, recTDs: 0,
    tackles: 0, sacks: 0, defInterceptions: 0, passBreakups: 0, forcedFumbles: 0,
    playerOfGame: false,
  };
}

function getRatingFactor(rating: number): number {
  // Convert 40-99 rating to a multiplier (0.5 to 1.5)
  return 0.5 + (rating - 40) / 59;
}

function getKeyPlayer(team: TeamSnapshot, position: string): PlayerSnapshot | null {
  const pos = team.players.filter((p) => p.position === position);
  if (!pos.length) return null;
  return pos.sort((a, b) => b.overall - a.overall)[0];
}

function getBoost(player: PlayerSnapshot | null): number {
  if (!player) return 0;
  let boost = player.motivationBoost;
  if (player.spotlighted) boost += 5;
  if (player.traits.includes("CLUTCH_GENE")) boost += 3;
  return boost;
}

function simulateDrive(
  offTeam: TeamSnapshot,
  defTeam: TeamSnapshot,
  driveNumber: number,
  quarter: number,
  timeStart: number,
  stats: Map<string, PlayerStatLine>,
): DriveResult {
  const startYardLine = rng(10, 35);
  const offAdvantage = (offTeam.offRating - defTeam.defRating) / 100;
  const speedBonus = (offTeam.speedRating - defTeam.speedRating) / 200;

  // Base success probability adjusted by matchup
  const driveSuccess = clamp(0.35 + offAdvantage + speedBonus, 0.15, 0.65);

  const qb = getKeyPlayer(offTeam, "QB");
  const rb = getKeyPlayer(offTeam, "RB");
  const wr = getKeyPlayer(offTeam, "WR");
  const dl = getKeyPlayer(defTeam, "DL");
  const lb = getKeyPlayer(defTeam, "LB");

  const numPlays = rng(3, 14);
  const yardsPerPlay = clamp(
    rng(2, 8) * getRatingFactor(offTeam.offRating) * (1 - getRatingFactor(defTeam.defRating) * 0.5),
    1, 12
  );
  const totalYards = Math.round(numPlays * yardsPerPlay);
  const timeElapsed = numPlays * rng(25, 45);

  // Drive outcome weights: TD, FG, PUNT, TURNOVER, TURNOVER_ON_DOWNS
  let weights: number[];
  if (driveSuccess > 0.55) weights = [40, 20, 25, 10, 5];
  else if (driveSuccess > 0.45) weights = [28, 22, 35, 10, 5];
  else if (driveSuccess > 0.35) weights = [18, 20, 45, 12, 5];
  else weights = [10, 15, 45, 22, 8];

  const resultIdx = weightedRandom(weights);
  const results = ["TOUCHDOWN", "FIELD_GOAL", "PUNT", "TURNOVER", "TURNOVER_ON_DOWNS"];
  const result = results[resultIdx];

  // Assign stats to key players
  let keyPlayerId: string | null = null;
  let narrative = "";

  const isPassHeavy = Math.random() > 0.45;

  if (qb && isPassHeavy) {
    const statLine = stats.get(qb.id) || emptyStatLine(qb.id, offTeam.id);
    const att = rng(2, 6);
    const comp = Math.round(att * clamp(0.5 + getRatingFactor(qb.overall) * 0.2, 0.4, 0.8));
    const yds = comp * rng(6, 14);
    statLine.passAttempts += att;
    statLine.passCompletions += comp;
    statLine.passYards += yds;
    if (result === "TOUCHDOWN") {
      statLine.passTDs += 1;
      if (wr) {
        const wrLine = stats.get(wr.id) || emptyStatLine(wr.id, offTeam.id);
        wrLine.targets += 2;
        wrLine.receptions += 1;
        wrLine.recYards += rng(8, 35);
        wrLine.recTDs += 1;
        stats.set(wr.id, wrLine);
        keyPlayerId = wr.id;
      }
    }
    if (result === "TURNOVER" && Math.random() > 0.5) {
      statLine.interceptions += 1;
      if (lb) {
        const lbLine = stats.get(lb.id) || emptyStatLine(lb.id, defTeam.id);
        lbLine.defInterceptions += 1;
        stats.set(lb.id, lbLine);
      }
    }
    stats.set(qb.id, statLine);
    if (!keyPlayerId) keyPlayerId = qb.id;
  } else if (rb) {
    const statLine = stats.get(rb.id) || emptyStatLine(rb.id, offTeam.id);
    const att = rng(2, 7);
    const yds = att * rng(3, 6);
    statLine.rushAttempts += att;
    statLine.rushYards += yds;
    if (result === "TOUCHDOWN") statLine.rushTDs += 1;
    stats.set(rb.id, statLine);
    keyPlayerId = rb.id;
  }

  // Defense stats
  if (dl) {
    const dlLine = stats.get(dl.id) || emptyStatLine(dl.id, defTeam.id);
    dlLine.tackles += rng(1, 4);
    if (result === "TURNOVER_ON_DOWNS" || result === "PUNT") {
      if (Math.random() > 0.7) dlLine.sacks += 0.5;
    }
    stats.set(dl.id, dlLine);
  }

  // Generate drive narrative
  const playerName = keyPlayerId
    ? (() => {
        const p = [...offTeam.players, ...defTeam.players].find((pl) => pl.id === keyPlayerId);
        return p ? `${p.firstName} ${p.lastName}` : "Unknown";
      })()
    : offTeam.abbreviation;

  const resultNarratives: Record<string, string[]> = {
    TOUCHDOWN: [
      `${playerName} punches it in. ${offTeam.abbreviation} scores.`,
      `${playerName} finds the end zone on a gutsy play.`,
      `Big-time drive capped by ${playerName}. Six points.`,
    ],
    FIELD_GOAL: [
      `${offTeam.abbreviation} settles for three. Kicker splits the uprights.`,
      `Drive stalls but they take the points. 3 more on the board.`,
    ],
    PUNT: [
      `Three and out. ${offTeam.abbreviation} punts it away.`,
      `${defTeam.abbreviation} defense holds firm. Punt.`,
    ],
    TURNOVER: [
      `Turnover. ${defTeam.abbreviation} makes the play.`,
      `Big mistake by ${offTeam.abbreviation}. Ball changes hands.`,
    ],
    TURNOVER_ON_DOWNS: [
      `${offTeam.abbreviation} goes for it and comes up short.`,
      `Fourth down stop. ${defTeam.abbreviation} gets the ball.`,
    ],
  };

  const narr = resultNarratives[result] || ["Drive ends."];
  narrative = narr[rng(0, narr.length - 1)];

  return {
    driveNumber,
    offTeamId: offTeam.id,
    startYardLine,
    endYardLine: result === "TOUCHDOWN" ? 100 : clamp(startYardLine + totalYards, 0, 99),
    plays: numPlays,
    yards: totalYards,
    result,
    timeElapsed,
    quarter,
    timeStart,
    keyPlayerId,
    narrative,
  };
}

export function simulateGame(
  home: TeamSnapshot,
  away: TeamSnapshot,
  motivationBoosts: { homeBoost: number; awayBoost: number } = { homeBoost: 0, awayBoost: 0 },
): GameResult {
  const drives: DriveResult[] = [];
  const stats = new Map<string, PlayerStatLine>();
  let homeScore = 0;
  let awayScore = 0;

  // Home field advantage
  const homeAdj = { ...home, offRating: home.offRating + 3 + motivationBoosts.homeBoost };

  // 4 quarters, roughly 12-15 drives per game
  let quarter = 1;
  let timeRemaining = 900; // 15 min quarters in seconds
  let driveNumber = 1;
  let possTeam: "home" | "away" = Math.random() > 0.5 ? "home" : "away";

  while (quarter <= 4 || (quarter === 5 && homeScore === awayScore)) {
    if (timeRemaining <= 0) {
      quarter++;
      timeRemaining = 900;
      if (quarter > 4 && homeScore !== awayScore) break;
      if (quarter > 5) break;
    }

    const offTeam = possTeam === "home" ? homeAdj : away;
    const defTeam = possTeam === "home" ? away : homeAdj;

    const drive = simulateDrive(offTeam, defTeam, driveNumber, quarter, timeRemaining, stats);
    drives.push(drive);

    // Score
    if (drive.result === "TOUCHDOWN") {
      const pts = Math.random() > 0.05 ? 7 : 6; // PAT miss rare
      if (possTeam === "home") homeScore += pts;
      else awayScore += pts;
    } else if (drive.result === "FIELD_GOAL") {
      if (possTeam === "home") homeScore += 3;
      else awayScore += 3;
    }

    timeRemaining -= drive.timeElapsed;
    driveNumber++;

    // Flip possession unless turnover (offense keeps the field position)
    if (drive.result === "TURNOVER" || drive.result === "TURNOVER_ON_DOWNS") {
      // keep same team but flip
    }
    possTeam = possTeam === "home" ? "away" : "home";

    // Safety valve: cap drives
    if (driveNumber > 30) break;
  }

  // Determine MVP
  let mvpPlayerId: string | null = null;
  let maxImpact = 0;
  stats.forEach((stat) => {
    const impact =
      stat.passYards * 0.04 +
      stat.passTDs * 6 +
      stat.rushYards * 0.1 +
      stat.rushTDs * 6 +
      stat.recYards * 0.08 +
      stat.recTDs * 6 +
      stat.sacks * 4 +
      stat.defInterceptions * 6;
    if (impact > maxImpact) {
      maxImpact = impact;
      mvpPlayerId = stat.playerId;
    }
  });

  if (mvpPlayerId) {
    const mvp = stats.get(mvpPlayerId);
    if (mvp) {
      mvp.playerOfGame = true;
      stats.set(mvpPlayerId, mvp);
    }
  }

  // Generate headline
  const winner = homeScore > awayScore ? home : homeScore < awayScore ? away : null;
  const loser = homeScore > awayScore ? away : homeScore < awayScore ? home : null;
  const scoreDiff = Math.abs(homeScore - awayScore);
  let headline = "";
  if (!winner) {
    headline = `${home.abbreviation} AND ${away.abbreviation} BATTLE TO OVERTIME`;
  } else if (scoreDiff >= 21) {
    headline = `${winner.abbreviation} DOMINATES — ${homeScore}-${awayScore}`;
  } else if (scoreDiff <= 3) {
    headline = `${winner!.abbreviation} ESCAPES WITH THE W — ${homeScore}-${awayScore}`;
  } else {
    headline = `${winner!.abbreviation} TAKES DOWN ${loser!.abbreviation} — ${homeScore}-${awayScore}`;
  }

  const narrative = `${away.name} at ${home.name}. Final: ${home.abbreviation} ${homeScore}, ${away.abbreviation} ${awayScore}. ${drives.filter((d) => d.result === "TOUCHDOWN").length} touchdowns scored. ${drives.length} total drives.`;

  return {
    homeScore,
    awayScore,
    overtime: homeScore === awayScore,
    drives,
    playerStats: stats,
    headline,
    narrative,
    mvpPlayerId,
  };
}
