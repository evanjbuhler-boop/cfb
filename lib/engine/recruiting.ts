import { rng, clamp } from "@/lib/utils";

export interface RecruitProfile {
  id: string;
  firstName: string;
  lastName: string;
  position: string;
  hometown: string;
  homeState: string;
  stars: number;
  nationalRank: number;
  overallRating: number;
  potential: number;
  devTrait: string;
  status: string;
  committedTeamId: string | null;

  // Personality factors
  prestigeDriven: number;
  playingTimeDriven: number;
  homesickness: number;
  loyaltyFactor: number;
  familyInfluence: number;
  coachRelationship: number;
  championshipDriven: number;
}

export interface TeamRecruitingProfile {
  id: string;
  name: string;
  state: string;
  prestige: number;
  facilityRating: number;
  academicRating: number;
  coachRecruitingRating: number;
  recentWins: number;
  recentTitles: number;
}

export function calcInterestGain(
  recruit: RecruitProfile,
  team: TeamRecruitingProfile,
  pointsInvested: number,
  hasVisited: boolean,
  pipelineStrength: number,
): number {
  let base = pointsInvested * 0.8;

  // Prestige alignment
  const prestigeBonus = (team.prestige / 10) * recruit.prestigeDriven * 0.3;

  // Proximity bonus
  const proximityBonus = recruit.homeState === team.state ? recruit.homesickness * 0.4 : 0;

  // Pipeline bonus (historic recruiting from that region)
  const pipelineBonus = pipelineStrength * 0.2;

  // Visit bonus
  const visitBonus = hasVisited ? 15 + recruit.coachRelationship * 0.1 : 0;

  // Championship pedigree
  const champBonus = team.recentTitles > 0 ? recruit.championshipDriven * 0.2 : 0;

  const total = base + prestigeBonus + proximityBonus + pipelineBonus + visitBonus + champBonus;
  return clamp(total, 0, 100);
}

export function calcFlipProbability(
  recruit: RecruitProfile,
  currentInterestLevel: number,
  competingTeamInterest: number,
): number {
  if (currentInterestLevel <= 0) return 0;
  const gap = competingTeamInterest - currentInterestLevel;
  if (gap <= 0) return 0;

  const baseFliip = gap * 0.3;
  const loyaltyDampener = recruit.loyaltyFactor * 0.4;
  const result = clamp(baseFliip - loyaltyDampener * 0.1, 0, 85);
  return result;
}

export function generateRecruitNarrative(
  recruit: RecruitProfile,
  eventType: "OFFER" | "VISIT" | "COMMIT" | "FLIP" | "DECOMMIT",
  teamName: string,
): string {
  const name = `${recruit.firstName} ${recruit.lastName}`;
  const pos = recruit.position;
  const stars = "⭐".repeat(recruit.stars);

  const narratives: Record<string, string[]> = {
    OFFER: [
      `${stars} ${pos} ${name} picks up an offer from ${teamName}. The ${recruit.hometown} native is drawing serious interest.`,
      `${teamName} extends a scholarship to ${name}, the ${recruit.stars}-star ${pos} out of ${recruit.hometown}.`,
      `Big board growing for ${name}. ${teamName} throws their name in the mix.`,
    ],
    VISIT: [
      `${name} takes an unofficial visit to ${teamName}. Word is the staff made a strong impression.`,
      `${teamName} rolls out the red carpet for ${name}. Visit described as "incredible" by sources close to the recruit.`,
      `${name} on campus at ${teamName}. The ${pos} prospect soaking in the atmosphere.`,
    ],
    COMMIT: [
      `BREAKING: ${name} commits to ${teamName}! The ${recruit.stars}-star ${pos} out of ${recruit.hometown} is ALL IN. 🎉`,
      `${name} makes it official — ${teamName} lands the ${pos} prospect. Huge pickup.`,
      `The wait is over. ${name} chooses ${teamName}. ${recruit.stars} stars, locked in.`,
    ],
    FLIP: [
      `FLIP ALERT: ${name} decommits and immediately pledges to ${teamName}. Seismic move in recruiting.`,
      `${name} flips his commitment to ${teamName}. Bold move — the ${pos} saw something he couldn't pass up.`,
      `Bombshell in recruiting: ${name} is out of his previous commitment and in with ${teamName}.`,
    ],
    DECOMMIT: [
      `${name} has decommitted. The ${recruit.stars}-star ${pos} is back on the board. Expect heavy contact from programs nationwide.`,
      `Decommitment: ${name} opens up his recruitment again. This one's going to get wild.`,
      `${name} steps back from his commitment. Sources say he wants to take more visits before deciding.`,
    ],
  };

  const options = narratives[eventType] || [`${name} makes a move in his recruitment.`];
  return options[rng(0, options.length - 1)];
}

export function generateSigningDayClass(
  recruits: RecruitProfile[],
  teamName: string,
): string {
  const signed = recruits.filter((r) => r.committedTeamId !== null);
  const stars5 = signed.filter((r) => r.stars === 5).length;
  const stars4 = signed.filter((r) => r.stars === 4).length;
  const stars3 = signed.filter((r) => r.stars === 3).length;

  if (signed.length === 0) return `${teamName} finishes with no signed class.`;

  const quality = stars5 > 2 ? "elite" : stars4 > 5 ? "strong" : "solid";
  return `${teamName} wraps up an ${quality} signing class. ${stars5} five-stars, ${stars4} four-stars, ${stars3} three-stars. Class of ${signed.length}.`;
}
