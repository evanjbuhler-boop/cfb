export const dynamic = "force-dynamic";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { rng, clamp } from "@/lib/utils";

const CONFERENCES = [
  { name: "Southeastern Conference", abbreviation: "SEC", tier: "P4" },
  { name: "Big Ten Conference", abbreviation: "B1G", tier: "P4" },
  { name: "Big 12 Conference", abbreviation: "B12", tier: "P4" },
  { name: "Atlantic Coast Conference", abbreviation: "ACC", tier: "P4" },
  { name: "American Athletic Conference", abbreviation: "AAC", tier: "G5" },
  { name: "Mountain West Conference", abbreviation: "MWC", tier: "G5" },
  { name: "Sun Belt Conference", abbreviation: "SBC", tier: "G5" },
  { name: "Conference USA", abbreviation: "CUSA", tier: "G5" },
  { name: "Mid-American Conference", abbreviation: "MAC", tier: "G5" },
  { name: "FBS Independents", abbreviation: "IND", tier: "IND" },
];

const TEAMS_DATA = [
  // SEC
  { name: "Alabama Crimson Tide", abbr: "ALA", mascot: "Crimson Tide", city: "Tuscaloosa", state: "AL", conf: "SEC", prestige: 10, fac: 10, acad: 7, stadium: 101821, primary: "#9E1B32", secondary: "#828A8F", budget: 12000000 },
  { name: "Georgia Bulldogs", abbr: "UGA", mascot: "Bulldogs", city: "Athens", state: "GA", conf: "SEC", prestige: 10, fac: 10, acad: 8, stadium: 92746, primary: "#BA0C2F", secondary: "#000000", budget: 11000000 },
  { name: "LSU Tigers", abbr: "LSU", mascot: "Tigers", city: "Baton Rouge", state: "LA", conf: "SEC", prestige: 9, fac: 9, acad: 6, stadium: 102321, primary: "#461D7C", secondary: "#FDD023", budget: 10000000 },
  { name: "Texas Longhorns", abbr: "TEX", mascot: "Longhorns", city: "Austin", state: "TX", conf: "SEC", prestige: 9, fac: 9, acad: 8, stadium: 100119, primary: "#BF5700", secondary: "#FFFFFF", budget: 11000000 },
  { name: "Florida Gators", abbr: "FLA", mascot: "Gators", city: "Gainesville", state: "FL", conf: "SEC", prestige: 8, fac: 9, acad: 8, stadium: 88548, primary: "#0021A5", secondary: "#FA4616", budget: 9000000 },
  { name: "Tennessee Volunteers", abbr: "TENN", mascot: "Volunteers", city: "Knoxville", state: "TN", conf: "SEC", prestige: 8, fac: 8, acad: 7, stadium: 102455, primary: "#FF8200", secondary: "#FFFFFF", budget: 9000000 },
  { name: "Ole Miss Rebels", abbr: "MISS", mascot: "Rebels", city: "Oxford", state: "MS", conf: "SEC", prestige: 7, fac: 7, acad: 6, stadium: 64038, primary: "#CE1126", secondary: "#14213D", budget: 7000000 },
  { name: "Auburn Tigers", abbr: "AUB", mascot: "Tigers", city: "Auburn", state: "AL", conf: "SEC", prestige: 8, fac: 8, acad: 7, stadium: 87451, primary: "#0C2340", secondary: "#E87722", budget: 8500000 },
  { name: "Arkansas Razorbacks", abbr: "ARK", mascot: "Razorbacks", city: "Fayetteville", state: "AR", conf: "SEC", prestige: 7, fac: 7, acad: 7, stadium: 76416, primary: "#9D2235", secondary: "#FFFFFF", budget: 7500000 },
  // B1G
  { name: "Ohio State Buckeyes", abbr: "OSU", mascot: "Buckeyes", city: "Columbus", state: "OH", conf: "B1G", prestige: 10, fac: 10, acad: 8, stadium: 102780, primary: "#BB0000", secondary: "#666666", budget: 11500000 },
  { name: "Michigan Wolverines", abbr: "MICH", mascot: "Wolverines", city: "Ann Arbor", state: "MI", conf: "B1G", prestige: 9, fac: 9, acad: 10, stadium: 107601, primary: "#00274C", secondary: "#FFCB05", budget: 10500000 },
  { name: "Penn State Nittany Lions", abbr: "PSU", mascot: "Nittany Lions", city: "State College", state: "PA", conf: "B1G", prestige: 9, fac: 9, acad: 8, stadium: 106572, primary: "#041E42", secondary: "#FFFFFF", budget: 10000000 },
  { name: "Oregon Ducks", abbr: "ORE", mascot: "Ducks", city: "Eugene", state: "OR", conf: "B1G", prestige: 9, fac: 9, acad: 7, stadium: 54000, primary: "#154733", secondary: "#FEE123", budget: 10000000 },
  { name: "USC Trojans", abbr: "USC", mascot: "Trojans", city: "Los Angeles", state: "CA", conf: "B1G", prestige: 9, fac: 9, acad: 9, stadium: 77500, primary: "#990000", secondary: "#FFC72C", budget: 10500000 },
  { name: "Wisconsin Badgers", abbr: "WIS", mascot: "Badgers", city: "Madison", state: "WI", conf: "B1G", prestige: 8, fac: 8, acad: 8, stadium: 80321, primary: "#C5050C", secondary: "#FFFFFF", budget: 8500000 },
  { name: "Iowa Hawkeyes", abbr: "IOWA", mascot: "Hawkeyes", city: "Iowa City", state: "IA", conf: "B1G", prestige: 7, fac: 8, acad: 8, stadium: 69250, primary: "#FFCD00", secondary: "#000000", budget: 7500000 },
  { name: "Michigan State Spartans", abbr: "MSU", mascot: "Spartans", city: "East Lansing", state: "MI", conf: "B1G", prestige: 7, fac: 7, acad: 7, stadium: 75005, primary: "#18453B", secondary: "#FFFFFF", budget: 7000000 },
  // B12
  { name: "Oklahoma Sooners", abbr: "OU", mascot: "Sooners", city: "Norman", state: "OK", conf: "B12", prestige: 9, fac: 9, acad: 7, stadium: 80126, primary: "#841617", secondary: "#FDF9D8", budget: 10000000 },
  { name: "Kansas State Wildcats", abbr: "KSU", mascot: "Wildcats", city: "Manhattan", state: "KS", conf: "B12", prestige: 7, fac: 7, acad: 7, stadium: 50000, primary: "#512888", secondary: "#FFFFFF", budget: 7000000 },
  { name: "TCU Horned Frogs", abbr: "TCU", mascot: "Horned Frogs", city: "Fort Worth", state: "TX", conf: "B12", prestige: 7, fac: 7, acad: 8, stadium: 45000, primary: "#4D1979", secondary: "#A3A9AC", budget: 7000000 },
  { name: "Baylor Bears", abbr: "BAY", mascot: "Bears", city: "Waco", state: "TX", conf: "B12", prestige: 7, fac: 7, acad: 7, stadium: 45140, primary: "#003015", secondary: "#FFB81C", budget: 6500000 },
  { name: "Texas Tech Red Raiders", abbr: "TTU", mascot: "Red Raiders", city: "Lubbock", state: "TX", conf: "B12", prestige: 6, fac: 7, acad: 6, stadium: 60454, primary: "#CC0000", secondary: "#000000", budget: 6000000 },
  // ACC
  { name: "Clemson Tigers", abbr: "CLEM", mascot: "Tigers", city: "Clemson", state: "SC", conf: "ACC", prestige: 9, fac: 9, acad: 8, stadium: 81500, primary: "#F56600", secondary: "#522D80", budget: 10000000 },
  { name: "Florida State Seminoles", abbr: "FSU", mascot: "Seminoles", city: "Tallahassee", state: "FL", conf: "ACC", prestige: 8, fac: 8, acad: 7, stadium: 79560, primary: "#782F40", secondary: "#CEB888", budget: 9000000 },
  { name: "Miami Hurricanes", abbr: "MIA", mascot: "Hurricanes", city: "Miami", state: "FL", conf: "ACC", prestige: 8, fac: 8, acad: 8, stadium: 65326, primary: "#005030", secondary: "#F47321", budget: 9000000 },
  { name: "North Carolina Tar Heels", abbr: "UNC", mascot: "Tar Heels", city: "Chapel Hill", state: "NC", conf: "ACC", prestige: 7, fac: 7, acad: 9, stadium: 63000, primary: "#4B9CD3", secondary: "#FFFFFF", budget: 7000000 },
  // IND
  { name: "Notre Dame Fighting Irish", abbr: "ND", mascot: "Fighting Irish", city: "Notre Dame", state: "IN", conf: "IND", prestige: 10, fac: 9, acad: 10, stadium: 77622, primary: "#0C2340", secondary: "#C99700", budget: 11000000 },
  // AAC
  { name: "Memphis Tigers", abbr: "MEM", mascot: "Tigers", city: "Memphis", state: "TN", conf: "AAC", prestige: 5, fac: 6, acad: 6, stadium: 58325, primary: "#003087", secondary: "#898D8D", budget: 4000000 },
  { name: "Tulane Green Wave", abbr: "TUL", mascot: "Green Wave", city: "New Orleans", state: "LA", conf: "AAC", prestige: 5, fac: 5, acad: 8, stadium: 30000, primary: "#006747", secondary: "#418FDE", budget: 3500000 },
  // MWC
  { name: "Boise State Broncos", abbr: "BSU", mascot: "Broncos", city: "Boise", state: "ID", conf: "MWC", prestige: 6, fac: 6, acad: 6, stadium: 36387, primary: "#D64309", secondary: "#0033A0", budget: 4500000 },
  { name: "San Diego State Aztecs", abbr: "SDSU", mascot: "Aztecs", city: "San Diego", state: "CA", conf: "MWC", prestige: 5, fac: 6, acad: 7, stadium: 35000, primary: "#A6192E", secondary: "#000000", budget: 4000000 },
  // SBC
  { name: "Coastal Carolina Chanticleers", abbr: "CCU", mascot: "Chanticleers", city: "Conway", state: "SC", conf: "SBC", prestige: 4, fac: 5, acad: 5, stadium: 21000, primary: "#006F51", secondary: "#A6903B", budget: 2500000 },
  { name: "App State Mountaineers", abbr: "APP", mascot: "Mountaineers", city: "Boone", state: "NC", conf: "SBC", prestige: 5, fac: 5, acad: 6, stadium: 36000, primary: "#000000", secondary: "#FFCC00", budget: 3000000 },
];

const FIRST_NAMES = ["Marcus","Jaylen","DeAndre","Malik","Trevion","Jordan","Xavier","Isaiah","Darius","Caleb","Noah","Elijah","Aiden","Cam","Tyrese","Devonte","Bryce","Jaylon","Kendrick","Quinton","Roman","Donte","Tre","Lavonte","Rashad","Damian","Jalen","Kobe","Terrell","DeShawn","LaMarcus","Jamar","Cortez","Devin","Latrell","Nico","Jaxon","Bo","Tank","Zach","Will","Cole","Jake","Brady","Carson","Trace","Hunter","Dalton","Peyton","Drew"];
const LAST_NAMES = ["Johnson","Williams","Brown","Davis","Wilson","Anderson","Thomas","Jackson","White","Harris","Martin","Thompson","Garcia","Martinez","Robinson","Clark","Rodriguez","Lewis","Lee","Walker","Hall","Allen","Young","Hernandez","King","Wright","Lopez","Hill","Scott","Green","Adams","Baker","Nelson","Mitchell","Carter","Perez","Turner","Phillips","Campbell","Parker","Evans","Collins","Edwards","Stewart","Sanchez","Morris","Rogers","Reed","Cook","Morgan"];
const STATES = ["AL","GA","FL","TX","CA","OH","PA","NC","SC","TN","LA","MS","AR","OK","KS","MI","WI","IA","IN","IL"];
const CITIES = ["Atlanta","Dallas","Houston","Miami","Orlando","Memphis","Birmingham","Nashville","Charlotte","Columbus","Detroit","Chicago","Los Angeles","New Orleans","Jacksonville","Baton Rouge","Jackson","Little Rock","Oklahoma City","Wichita"];
const POSITIONS = ["QB","RB","WR","WR","TE","OL","OL","DL","DL","LB","CB","CB","S"];
const DEV_TRAITS = ["NORMAL","NORMAL","NORMAL","NORMAL","IMPACT","IMPACT","STAR","ELITE"] as const;
const PLAYER_TRAITS = ["COACHES_FAVORITE","CLUTCH_GENE","FILM_ROOM_RAT","MOTOR","SHOWBOAT","LOCKER_ROOM_LEADER","RAW","WORKHORSE","COMEBACK_KID","ELUSIVE_BACK","FIELD_GENERAL","HOT_HEAD"] as const;

function randName() {
  return { first: FIRST_NAMES[rng(0,FIRST_NAMES.length-1)], last: LAST_NAMES[rng(0,LAST_NAMES.length-1)] };
}

function generatePlayer(position: string, year: string, teamPrestige: number) {
  const { first, last } = randName();
  const yearMod: Record<string,number> = { FR:0, SO:5, JR:10, SR:14, GR:16 };
  const base = clamp(55 + (yearMod[year]||0) + Math.floor((teamPrestige-5)*2) + rng(-8,8), 50, 85);
  const devTrait = DEV_TRAITS[rng(0,DEV_TRAITS.length-1)];
  const potential = clamp(base + rng(5,20), 60, 99);

  const posSpecific: Record<string, Record<string,number>> = {
    QB: { throwPower: clamp(rng(60,90),50,99), throwAccuracy: clamp(rng(60,90),50,99), throwOnRun: clamp(rng(55,85),50,99), clutch: clamp(rng(55,90),50,99) },
    RB: { ballCarrying: clamp(rng(60,90),50,99), breakTackle: clamp(rng(55,88),50,99), elusiveness: clamp(rng(60,92),50,99), trucking: clamp(rng(55,88),50,99) },
    WR: { catching: clamp(rng(60,92),50,99), routeRunning: clamp(rng(58,90),50,99), separation: clamp(rng(58,90),50,99) },
    TE: { catching: clamp(rng(55,85),50,99), routeRunning: clamp(rng(50,80),50,99), runBlocking: clamp(rng(55,85),50,99) },
    OL: { runBlocking: clamp(rng(60,90),50,99), passBlocking: clamp(rng(60,90),50,99) },
    DL: { blockShedding: clamp(rng(58,90),50,99), powerMoves: clamp(rng(55,88),50,99), tackling: clamp(rng(60,90),50,99) },
    LB: { tackling: clamp(rng(62,92),50,99), pursuit: clamp(rng(60,88),50,99), coverage: clamp(rng(50,80),50,99) },
    CB: { manCoverage: clamp(rng(62,92),50,99), zoneCoverage: clamp(rng(60,90),50,99), coverage: clamp(rng(62,92),50,99) },
    S:  { coverage: clamp(rng(60,90),50,99), tackling: clamp(rng(60,88),50,99), playRecognition: clamp(rng(60,90),50,99) },
  };

  const trait = Math.random() > 0.65 ? PLAYER_TRAITS[rng(0,PLAYER_TRAITS.length-1)] : null;
  const recruitStars = teamPrestige >= 9 ? rng(3,5) : teamPrestige >= 7 ? rng(2,4) : rng(1,3);

  return {
    firstName: first, lastName: last, position, year,
    jerseyNumber: rng(1,99),
    hometown: CITIES[rng(0,CITIES.length-1)],
    homeState: STATES[rng(0,STATES.length-1)],
    height: position==="OL" ? rng(74,78) : position==="QB" ? rng(72,77) : rng(68,76),
    weight: position==="OL" ? rng(295,330) : position==="RB" ? rng(195,225) : position==="WR" ? rng(175,205) : rng(200,260),
    overall: base, speed: clamp(rng(60,92),50,99), strength: clamp(rng(55,88),50,99),
    agility: clamp(rng(58,90),50,99), awareness: clamp(rng(52,88),50,99),
    potential, devTrait, recruitStars,
    morale: rng(65,95), leadership: rng(40,90), character: rng(60,95),
    ...(posSpecific[position] || {}),
    trait,
  };
}

function generateRecruit(nationalRank: number, enrollYear: number) {
  const { first, last } = randName();
  const position = POSITIONS[rng(0,POSITIONS.length-1)];
  const stars = nationalRank<=50 ? 5 : nationalRank<=250 ? 4 : nationalRank<=800 ? 3 : rng(2,3);
  return {
    firstName: first, lastName: last, position,
    hometown: CITIES[rng(0,CITIES.length-1)], homeState: STATES[rng(0,STATES.length-1)],
    height: rng(68,77), weight: rng(180,290),
    stars, nationalRank,
    positionRank: clamp(Math.floor(nationalRank/4)+rng(1,15),1,200),
    stateRank: rng(1,30),
    gpa: parseFloat((rng(25,40)/10).toFixed(1)),
    academicRating: rng(50,90),
    speedRating: rng(70,98), athleticismScore: rng(65,98),
    overallRating: stars===5 ? rng(85,95) : stars===4 ? rng(76,87) : stars===3 ? rng(68,78) : rng(60,70),
    potential: clamp(rng(70,99),60,99),
    devTrait: DEV_TRAITS[rng(0,DEV_TRAITS.length-1)],
    loyaltyFactor: rng(20,90), homesickness: rng(10,80), prestigeDriven: rng(20,95),
    playingTimeDriven: rng(15,90), academicDriven: rng(10,85), familyInfluence: rng(10,80),
    coachRelationship: rng(20,90), cityKidFactor: rng(10,80), championshipDriven: rng(20,95),
    status: "UNCOMMITTED", enrollYear,
  };
}

function uid() { return crypto.randomUUID(); }

export async function GET() {
  // Wipe in dependency order (ignore errors if tables empty)
  const deletes = [
    "newsItem","spotlightPlayer","playerDevEvent","playerAward",
    "playerGameStat","playerSeasonStat","playerTrait","gameDrive","game",
    "teamSeason","teamRanking","coachSeason","coachHistory","coach","player",
    "recruitTimeline","recruitVisit","recruitingInterest","scholarshipOffer",
    "recruit","userDynasty","season","team","conference",
  ] as const;
  for (const model of deletes) {
    try { await (prisma[model] as { deleteMany: () => Promise<unknown> }).deleteMany(); } catch { /* ignore */ }
  }

  // Conferences (bulk)
  await prisma.conference.createMany({ data: CONFERENCES });
  const confs = await prisma.conference.findMany();
  const confMap = new Map(confs.map(c => [c.abbreviation, c.id]));

  // Build all team/player/coach/trait data in memory first, then bulk insert
  const teamRows = TEAMS_DATA.map(t => ({
    id: uid(),
    name: t.name, abbreviation: t.abbr, mascot: t.mascot,
    city: t.city, state: t.state, conferenceId: confMap.get(t.conf)!,
    prestige: t.prestige, facilityRating: t.fac, academicRating: t.acad,
    recruitingBudget: t.budget, stadiumCapacity: t.stadium,
    primaryColor: t.primary, secondaryColor: t.secondary,
    createdAt: new Date(),
  }));
  await prisma.team.createMany({ data: teamRows });
  const teamIdMap = new Map(teamRows.map((t, i) => [TEAMS_DATA[i].abbr, t.id]));

  const allPlayers: Record<string, unknown>[] = [];
  const allTraits: { playerId: string; trait: string }[] = [];
  const allCoaches: Record<string, unknown>[] = [];
  const SCHEMES = ["PRO_STYLE","SPREAD","AIR_RAID","RPO","POWER_RUN"];
  const DEF_SCHEMES = ["FOUR_THREE","THREE_FOUR","NICKEL","COVER_THREE"];
  const PERSONALITIES = ["DISCIPLINARIAN","PLAYER_FRIENDLY","TACTICIAN","RECRUITER","DEVELOPER","MOTIVATOR"];
  const ROSTER_DEF: [number, string][] = [[2,"QB"],[3,"RB"],[5,"WR"],[2,"TE"],[5,"OL"],[4,"DL"],[4,"LB"],[4,"CB"],[3,"S"]];
  const YEARS = ["FR","FR","SO","SO","JR","JR","SR","SR","GR"];

  for (const t of TEAMS_DATA) {
    const teamId = teamIdMap.get(t.abbr)!;
    const positions: string[] = [];
    ROSTER_DEF.forEach(([n, p]) => { for (let i = 0; i < n; i++) positions.push(p); });

    for (const pos of positions) {
      const pData = generatePlayer(pos, YEARS[rng(0, YEARS.length - 1)], t.prestige);
      const { trait, ...playerData } = pData;
      const playerId = uid();
      allPlayers.push({ id: playerId, ...playerData, teamId, createdAt: new Date(), updatedAt: new Date() });
      if (trait) allTraits.push({ playerId, trait });
    }

    const cn = randName();
    allCoaches.push({
      id: uid(), teamId, firstName: cn.first, lastName: cn.last,
      role: "HEAD_COACH", age: rng(38, 62),
      offenseRating: clamp(t.prestige * 8 + rng(-10, 10), 50, 99),
      defenseRating: clamp(t.prestige * 8 + rng(-10, 10), 50, 99),
      recruitingRating: clamp(t.prestige * 9 + rng(-10, 10), 50, 99),
      playerDev: clamp(t.prestige * 8 + rng(-10, 10), 50, 99),
      gameManagement: clamp(t.prestige * 8 + rng(-10, 10), 50, 99),
      motivation: clamp(t.prestige * 8 + rng(-10, 10), 50, 99),
      discipline: clamp(rng(50, 90), 40, 99),
      offScheme: SCHEMES[rng(0, SCHEMES.length - 1)],
      defScheme: DEF_SCHEMES[rng(0, DEF_SCHEMES.length - 1)],
      careerWins: rng(0, 120), careerLosses: rng(0, 80),
      reputation: t.prestige * 9 + rng(-5, 5),
      contractYears: rng(2, 6), salary: t.prestige * 800000 + rng(-200000, 200000),
      personality: PERSONALITIES[rng(0, PERSONALITIES.length - 1)],
      createdAt: new Date(),
    });
  }

  // Single bulk insert for each type — no round-trips
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  await prisma.player.createMany({ data: allPlayers as any });
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  await prisma.coach.createMany({ data: allCoaches as any });
  if (allTraits.length) await prisma.playerTrait.createMany({ data: allTraits });
  await prisma.recruit.createMany({
    data: Array.from({ length: 600 }, (_, i) => generateRecruit(i + 1, 2026)),
  });

  return NextResponse.json({ success: true, teams: TEAMS_DATA.length, players: allPlayers.length, recruits: 600 });
}
