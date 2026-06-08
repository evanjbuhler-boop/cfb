import { rng } from "@/lib/utils";

export type NewsCategory =
  | "GAME_RESULT"
  | "RECRUITING"
  | "COACHING"
  | "PLAYER_DEVELOPMENT"
  | "TRANSFER"
  | "INJURY"
  | "RANKINGS"
  | "AWARD"
  | "SPOTLIGHT"
  | "RIVALRY";

export interface GeneratedNews {
  category: NewsCategory;
  headline: string;
  body: string;
  isBreaking: boolean;
  isNational: boolean;
}

export function generateGameNews(
  winner: string,
  loser: string,
  winScore: number,
  lossScore: number,
  mvpName: string,
  isRivalry: boolean,
): GeneratedNews {
  const diff = winScore - lossScore;
  const headlines = diff >= 21
    ? [
        `${winner.toUpperCase()} PUTS A BEAT DOWN ON ${loser.toUpperCase()}`,
        `DOMINANT: ${winner.toUpperCase()} ROLLS PAST ${loser.toUpperCase()} ${winScore}-${lossScore}`,
      ]
    : diff <= 3
    ? [
        `${winner.toUpperCase()} SURVIVES IN A CLASSIC — ${winScore}-${lossScore}`,
        `LAST SECOND DRAMA: ${winner.toUpperCase()} ESCAPES ${loser.toUpperCase()}`,
      ]
    : [
        `${winner.toUpperCase()} HANDLES BUSINESS — ${winScore}-${lossScore}`,
        `W FOR ${winner.toUpperCase()} OVER ${loser.toUpperCase()}`,
      ];

  const bodies = [
    `${mvpName} was the difference maker. ${winner} controlled the line of scrimmage and made the plays when it mattered. ${loser} had their chances but couldn't cash in.`,
    `Another statement win for ${winner}. ${mvpName} put on a show and the defense held firm when the pressure was on. ${loser} heads home searching for answers.`,
  ];

  return {
    category: "GAME_RESULT",
    headline: headlines[rng(0, headlines.length - 1)],
    body: bodies[rng(0, bodies.length - 1)],
    isBreaking: diff <= 7 || isRivalry,
    isNational: isRivalry || diff >= 28,
  };
}

export function generateRankingsNews(
  teamName: string,
  newRank: number,
  oldRank: number | null,
): GeneratedNews {
  const moved = oldRank ? (oldRank > newRank ? "up" : "down") : "in";
  const headlines = [
    `${teamName.toUpperCase()} MOVES ${moved === "up" ? "UP" : moved === "down" ? "DOWN" : "INTO"} THE RANKINGS AT #${newRank}`,
    `POLL WATCH: ${teamName.toUpperCase()} SITS AT #${newRank} THIS WEEK`,
  ];
  return {
    category: "RANKINGS",
    headline: headlines[rng(0, headlines.length - 1)],
    body: `The latest AP Poll has ${teamName} at #${newRank}. ${moved === "up" ? "The program is surging." : moved === "down" ? "A tough week drops them." : "First time in the rankings this season."}`,
    isBreaking: newRank <= 5,
    isNational: newRank <= 10,
  };
}

export function generateSpotlightNews(
  playerName: string,
  teamName: string,
  position: string,
  statHighlight: string,
): GeneratedNews {
  const headlines = [
    `SPOTLIGHT: ${playerName.toUpperCase()} IS THAT DUDE`,
    `${playerName.toUpperCase()} ANNOUNCES HIS PRESENCE — ${statHighlight}`,
    `CAN'T STOP, WON'T STOP: ${playerName.toUpperCase()} GOES OFF`,
  ];
  const bodies = [
    `${playerName} is the player to watch at ${teamName}. The ${position} has that rare combination of instinct and ability that coaches dream about. The spotlight is on — and he's showing up.`,
    `Eyes on ${playerName}. The ${position} out of ${teamName} had ${statHighlight} and made it look easy. This is a name to remember.`,
  ];
  return {
    category: "SPOTLIGHT",
    headline: headlines[rng(0, headlines.length - 1)],
    body: bodies[rng(0, bodies.length - 1)],
    isBreaking: false,
    isNational: false,
  };
}

export function generateRecruitingNews(
  recruitName: string,
  stars: number,
  position: string,
  teamName: string,
  eventType: "OFFER" | "COMMIT" | "FLIP" | "DECOMMIT",
): GeneratedNews {
  const starsStr = stars >= 5 ? "FIVE-STAR" : stars >= 4 ? "FOUR-STAR" : "THREE-STAR";
  const headlines: Record<string, string[]> = {
    OFFER: [`${teamName.toUpperCase()} OFFERS ${starsStr} ${position} ${recruitName.toUpperCase()}`],
    COMMIT: [`COMMITMENT: ${starsStr} ${recruitName.toUpperCase()} LOCKS IN WITH ${teamName.toUpperCase()} 🎉`],
    FLIP: [`🚨 FLIP: ${recruitName.toUpperCase()} BREAKS COMMITMENT, PLEDGES TO ${teamName.toUpperCase()}`],
    DECOMMIT: [`${recruitName.toUpperCase()} OPENS RECRUITMENT — ${starsStr} ${position} BACK ON THE BOARD`],
  };
  const h = headlines[eventType] || ["RECRUITING UPDATE"];
  const bodies = {
    OFFER: `${teamName} extends a scholarship offer to ${recruitName}, the ${starsStr.toLowerCase()} ${position}. Big board keeps growing.`,
    COMMIT: `${recruitName} is ALL IN with ${teamName}. The ${starsStr.toLowerCase()} ${position} made his decision and isn't looking back.`,
    FLIP: `Chaos in recruiting. ${recruitName} flips to ${teamName} in a massive move that shakes up the class rankings.`,
    DECOMMIT: `${recruitName} is back on the market. Programs around the country are already picking up the phone.`,
  };

  return {
    category: "RECRUITING",
    headline: h[rng(0, h.length - 1)],
    body: bodies[eventType] || "",
    isBreaking: eventType === "COMMIT" || eventType === "FLIP",
    isNational: stars >= 5 || eventType === "FLIP",
  };
}

export function generateInjuryNews(
  playerName: string,
  position: string,
  teamName: string,
  weeksOut: number,
): GeneratedNews {
  return {
    category: "INJURY",
    headline: `INJURY REPORT: ${playerName.toUpperCase()} QUESTIONABLE FOR ${teamName.toUpperCase()}`,
    body: `${playerName} (${position}) is dealing with an injury and is expected to miss ${weeksOut === 0 ? "this week's game" : `${weeksOut} week${weeksOut > 1 ? "s" : ""}`}. A significant blow to ${teamName}'s depth chart.`,
    isBreaking: weeksOut >= 4,
    isNational: false,
  };
}

export function generateDevEventNews(
  playerName: string,
  position: string,
  teamName: string,
  attribute: string,
  before: number,
  after: number,
): GeneratedNews {
  const improvement = after - before;
  const adjective = improvement >= 5 ? "massive" : "notable";
  return {
    category: "PLAYER_DEVELOPMENT",
    headline: `${playerName.toUpperCase()} MAKING STRIDES — DEVELOPMENT UPDATE`,
    body: `Film room and hard work paying off for ${playerName} (${position}, ${teamName}). The ${position}'s ${attribute} has shown ${adjective} improvement. Coaches love what they're seeing.`,
    isBreaking: false,
    isNational: false,
  };
}
