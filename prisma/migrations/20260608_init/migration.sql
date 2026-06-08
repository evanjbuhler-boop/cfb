Loaded Prisma config from prisma.config.ts.

-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "public";

-- CreateTable
CREATE TABLE "Conference" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "abbreviation" TEXT NOT NULL,
    "tier" TEXT NOT NULL,

    CONSTRAINT "Conference_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Team" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "abbreviation" TEXT NOT NULL,
    "mascot" TEXT NOT NULL,
    "city" TEXT NOT NULL,
    "state" TEXT NOT NULL,
    "conferenceId" TEXT NOT NULL,
    "prestige" INTEGER NOT NULL,
    "facilityRating" INTEGER NOT NULL,
    "academicRating" INTEGER NOT NULL,
    "recruitingBudget" INTEGER NOT NULL,
    "stadiumCapacity" INTEGER NOT NULL,
    "primaryColor" TEXT NOT NULL,
    "secondaryColor" TEXT NOT NULL,
    "rivalTeamId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Team_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Player" (
    "id" TEXT NOT NULL,
    "teamId" TEXT,
    "firstName" TEXT NOT NULL,
    "lastName" TEXT NOT NULL,
    "position" TEXT NOT NULL,
    "year" TEXT NOT NULL,
    "jerseyNumber" INTEGER,
    "hometown" TEXT NOT NULL,
    "homeState" TEXT NOT NULL,
    "height" INTEGER NOT NULL,
    "weight" INTEGER NOT NULL,
    "bio" TEXT,
    "recruitStars" INTEGER NOT NULL,
    "recruitRank" INTEGER,
    "overall" INTEGER NOT NULL,
    "speed" INTEGER NOT NULL,
    "strength" INTEGER NOT NULL,
    "agility" INTEGER NOT NULL,
    "awareness" INTEGER NOT NULL,
    "throwPower" INTEGER,
    "throwAccuracy" INTEGER,
    "throwOnRun" INTEGER,
    "playAction" INTEGER,
    "clutch" INTEGER,
    "catching" INTEGER,
    "routeRunning" INTEGER,
    "separation" INTEGER,
    "ballCarrying" INTEGER,
    "breakTackle" INTEGER,
    "trucking" INTEGER,
    "elusiveness" INTEGER,
    "yacAbility" INTEGER,
    "runBlocking" INTEGER,
    "passBlocking" INTEGER,
    "footwork" INTEGER,
    "tackling" INTEGER,
    "pursuit" INTEGER,
    "blockShedding" INTEGER,
    "finesseMoves" INTEGER,
    "powerMoves" INTEGER,
    "coverage" INTEGER,
    "manCoverage" INTEGER,
    "zoneCoverage" INTEGER,
    "pressureSense" INTEGER,
    "playRecognition" INTEGER,
    "hitPower" INTEGER,
    "kickPower" INTEGER,
    "kickAccuracy" INTEGER,
    "potential" INTEGER NOT NULL,
    "devTrait" TEXT NOT NULL DEFAULT 'NORMAL',
    "devProgress" INTEGER NOT NULL DEFAULT 0,
    "morale" INTEGER NOT NULL DEFAULT 80,
    "leadership" INTEGER NOT NULL DEFAULT 50,
    "character" INTEGER NOT NULL DEFAULT 75,
    "redshirted" BOOLEAN NOT NULL DEFAULT false,
    "redshirtYear" INTEGER,
    "inTransferPortal" BOOLEAN NOT NULL DEFAULT false,
    "declaringDraft" BOOLEAN NOT NULL DEFAULT false,
    "injured" BOOLEAN NOT NULL DEFAULT false,
    "injuryWeeks" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Player_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PlayerTrait" (
    "id" TEXT NOT NULL,
    "playerId" TEXT NOT NULL,
    "trait" TEXT NOT NULL,
    "addedBy" TEXT NOT NULL DEFAULT 'SYSTEM',

    CONSTRAINT "PlayerTrait_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PlayerDevEvent" (
    "id" TEXT NOT NULL,
    "playerId" TEXT NOT NULL,
    "seasonId" TEXT NOT NULL,
    "week" INTEGER NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "ratingBefore" INTEGER NOT NULL,
    "ratingAfter" INTEGER NOT NULL,
    "attribute" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PlayerDevEvent_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Recruit" (
    "id" TEXT NOT NULL,
    "firstName" TEXT NOT NULL,
    "lastName" TEXT NOT NULL,
    "position" TEXT NOT NULL,
    "hometown" TEXT NOT NULL,
    "homeState" TEXT NOT NULL,
    "height" INTEGER NOT NULL,
    "weight" INTEGER NOT NULL,
    "stars" INTEGER NOT NULL,
    "nationalRank" INTEGER NOT NULL,
    "positionRank" INTEGER NOT NULL,
    "stateRank" INTEGER NOT NULL,
    "gpa" DOUBLE PRECISION NOT NULL,
    "academicRating" INTEGER NOT NULL,
    "speedRating" INTEGER NOT NULL,
    "athleticismScore" INTEGER NOT NULL,
    "overallRating" INTEGER NOT NULL,
    "potential" INTEGER NOT NULL,
    "loyaltyFactor" INTEGER NOT NULL,
    "homesickness" INTEGER NOT NULL,
    "prestigeDriven" INTEGER NOT NULL,
    "playingTimeDriven" INTEGER NOT NULL,
    "academicDriven" INTEGER NOT NULL,
    "familyInfluence" INTEGER NOT NULL,
    "coachRelationship" INTEGER NOT NULL,
    "cityKidFactor" INTEGER NOT NULL,
    "championshipDriven" INTEGER NOT NULL,
    "devTrait" TEXT NOT NULL DEFAULT 'NORMAL',
    "scoutingData" TEXT NOT NULL DEFAULT '{}',
    "status" TEXT NOT NULL DEFAULT 'UNCOMMITTED',
    "committedTeamId" TEXT,
    "committedTeamName" TEXT,
    "earlyEnrollee" BOOLEAN NOT NULL DEFAULT false,
    "enrollYear" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Recruit_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ScholarshipOffer" (
    "id" TEXT NOT NULL,
    "recruitId" TEXT NOT NULL,
    "teamId" TEXT NOT NULL,
    "offeredAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "withdrawn" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "ScholarshipOffer_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RecruitingInterest" (
    "id" TEXT NOT NULL,
    "recruitId" TEXT NOT NULL,
    "teamId" TEXT NOT NULL,
    "interestLevel" INTEGER NOT NULL DEFAULT 0,
    "pointsInvested" INTEGER NOT NULL DEFAULT 0,
    "pipelineStrength" INTEGER NOT NULL DEFAULT 0,
    "hasVisited" BOOLEAN NOT NULL DEFAULT false,
    "visitType" TEXT,
    "visitImpact" INTEGER NOT NULL DEFAULT 0,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "RecruitingInterest_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RecruitVisit" (
    "id" TEXT NOT NULL,
    "recruitId" TEXT NOT NULL,
    "teamId" TEXT NOT NULL,
    "visitType" TEXT NOT NULL,
    "visitDate" TIMESTAMP(3) NOT NULL,
    "impactScore" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "RecruitVisit_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RecruitTimeline" (
    "id" TEXT NOT NULL,
    "recruitId" TEXT NOT NULL,
    "event" TEXT NOT NULL,
    "teamId" TEXT,
    "teamName" TEXT,
    "week" INTEGER NOT NULL,
    "season" INTEGER NOT NULL,
    "occurredAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "RecruitTimeline_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Coach" (
    "id" TEXT NOT NULL,
    "teamId" TEXT,
    "firstName" TEXT NOT NULL,
    "lastName" TEXT NOT NULL,
    "role" TEXT NOT NULL,
    "age" INTEGER NOT NULL,
    "offenseRating" INTEGER NOT NULL,
    "defenseRating" INTEGER NOT NULL,
    "recruitingRating" INTEGER NOT NULL,
    "playerDev" INTEGER NOT NULL,
    "gameManagement" INTEGER NOT NULL,
    "motivation" INTEGER NOT NULL,
    "discipline" INTEGER NOT NULL,
    "offScheme" TEXT,
    "defScheme" TEXT,
    "careerWins" INTEGER NOT NULL DEFAULT 0,
    "careerLosses" INTEGER NOT NULL DEFAULT 0,
    "hotSeat" INTEGER NOT NULL DEFAULT 0,
    "reputation" INTEGER NOT NULL,
    "contractYears" INTEGER NOT NULL DEFAULT 3,
    "salary" INTEGER NOT NULL,
    "personality" TEXT NOT NULL,
    "quote" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Coach_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CoachHistory" (
    "id" TEXT NOT NULL,
    "coachId" TEXT NOT NULL,
    "teamId" TEXT NOT NULL,
    "role" TEXT NOT NULL,
    "fromYear" INTEGER NOT NULL,
    "toYear" INTEGER,
    "wins" INTEGER NOT NULL DEFAULT 0,
    "losses" INTEGER NOT NULL DEFAULT 0,
    "reason" TEXT,

    CONSTRAINT "CoachHistory_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CoachSeason" (
    "id" TEXT NOT NULL,
    "coachId" TEXT NOT NULL,
    "seasonId" TEXT NOT NULL,
    "wins" INTEGER NOT NULL DEFAULT 0,
    "losses" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "CoachSeason_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Season" (
    "id" TEXT NOT NULL,
    "year" INTEGER NOT NULL,
    "currentWeek" INTEGER NOT NULL DEFAULT 0,
    "phase" TEXT NOT NULL DEFAULT 'PRESEASON',

    CONSTRAINT "Season_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TeamSeason" (
    "id" TEXT NOT NULL,
    "teamId" TEXT NOT NULL,
    "seasonId" TEXT NOT NULL,
    "wins" INTEGER NOT NULL DEFAULT 0,
    "losses" INTEGER NOT NULL DEFAULT 0,
    "confWins" INTEGER NOT NULL DEFAULT 0,
    "confLosses" INTEGER NOT NULL DEFAULT 0,
    "apRank" INTEGER,
    "cfpRank" INTEGER,
    "recruitingClassRank" INTEGER,
    "signingDayComplete" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "TeamSeason_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Game" (
    "id" TEXT NOT NULL,
    "seasonId" TEXT NOT NULL,
    "homeTeamId" TEXT NOT NULL,
    "awayTeamId" TEXT NOT NULL,
    "week" INTEGER NOT NULL,
    "gameType" TEXT NOT NULL DEFAULT 'REGULAR_SEASON',
    "neutralSite" BOOLEAN NOT NULL DEFAULT false,
    "simulated" BOOLEAN NOT NULL DEFAULT false,
    "homeScore" INTEGER,
    "awayScore" INTEGER,
    "overtime" BOOLEAN NOT NULL DEFAULT false,
    "motivationChoice" TEXT,
    "motivationBoosts" TEXT,
    "spotlightIds" TEXT,
    "headline" TEXT,
    "gameNarrative" TEXT,
    "mvpPlayerId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Game_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "GameDrive" (
    "id" TEXT NOT NULL,
    "gameId" TEXT NOT NULL,
    "driveNumber" INTEGER NOT NULL,
    "offTeamId" TEXT NOT NULL,
    "startYardLine" INTEGER NOT NULL,
    "endYardLine" INTEGER NOT NULL,
    "plays" INTEGER NOT NULL,
    "yards" INTEGER NOT NULL,
    "result" TEXT NOT NULL,
    "timeElapsed" INTEGER NOT NULL,
    "quarter" INTEGER NOT NULL,
    "timeStart" INTEGER NOT NULL,
    "keyPlayerId" TEXT,
    "narrative" TEXT,

    CONSTRAINT "GameDrive_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PlayerGameStat" (
    "id" TEXT NOT NULL,
    "gameId" TEXT NOT NULL,
    "playerId" TEXT NOT NULL,
    "teamId" TEXT NOT NULL,
    "passAttempts" INTEGER NOT NULL DEFAULT 0,
    "passCompletions" INTEGER NOT NULL DEFAULT 0,
    "passYards" INTEGER NOT NULL DEFAULT 0,
    "passTDs" INTEGER NOT NULL DEFAULT 0,
    "interceptions" INTEGER NOT NULL DEFAULT 0,
    "qbRating" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "sacked" INTEGER NOT NULL DEFAULT 0,
    "sackedYards" INTEGER NOT NULL DEFAULT 0,
    "rushAttempts" INTEGER NOT NULL DEFAULT 0,
    "rushYards" INTEGER NOT NULL DEFAULT 0,
    "rushTDs" INTEGER NOT NULL DEFAULT 0,
    "yardsAfterContact" INTEGER NOT NULL DEFAULT 0,
    "brokenTackles" INTEGER NOT NULL DEFAULT 0,
    "longRush" INTEGER NOT NULL DEFAULT 0,
    "targets" INTEGER NOT NULL DEFAULT 0,
    "receptions" INTEGER NOT NULL DEFAULT 0,
    "recYards" INTEGER NOT NULL DEFAULT 0,
    "recTDs" INTEGER NOT NULL DEFAULT 0,
    "yac" INTEGER NOT NULL DEFAULT 0,
    "drops" INTEGER NOT NULL DEFAULT 0,
    "longRec" INTEGER NOT NULL DEFAULT 0,
    "tackles" INTEGER NOT NULL DEFAULT 0,
    "soloTackles" INTEGER NOT NULL DEFAULT 0,
    "tacklesForLoss" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "sacks" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "forcedFumbles" INTEGER NOT NULL DEFAULT 0,
    "defInterceptions" INTEGER NOT NULL DEFAULT 0,
    "passBreakups" INTEGER NOT NULL DEFAULT 0,
    "qbHurries" INTEGER NOT NULL DEFAULT 0,
    "kickReturnYards" INTEGER NOT NULL DEFAULT 0,
    "kickReturnTDs" INTEGER NOT NULL DEFAULT 0,
    "puntReturnYards" INTEGER NOT NULL DEFAULT 0,
    "puntReturnTDs" INTEGER NOT NULL DEFAULT 0,
    "fgMade" INTEGER NOT NULL DEFAULT 0,
    "fgAttempts" INTEGER NOT NULL DEFAULT 0,
    "playerOfGame" BOOLEAN NOT NULL DEFAULT false,
    "spotlightGame" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "PlayerGameStat_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PlayerSeasonStat" (
    "id" TEXT NOT NULL,
    "playerId" TEXT NOT NULL,
    "seasonId" TEXT NOT NULL,
    "teamId" TEXT NOT NULL,
    "gamesPlayed" INTEGER NOT NULL DEFAULT 0,
    "passAttempts" INTEGER NOT NULL DEFAULT 0,
    "passCompletions" INTEGER NOT NULL DEFAULT 0,
    "passYards" INTEGER NOT NULL DEFAULT 0,
    "passTDs" INTEGER NOT NULL DEFAULT 0,
    "interceptions" INTEGER NOT NULL DEFAULT 0,
    "qbRating" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "rushAttempts" INTEGER NOT NULL DEFAULT 0,
    "rushYards" INTEGER NOT NULL DEFAULT 0,
    "rushTDs" INTEGER NOT NULL DEFAULT 0,
    "targets" INTEGER NOT NULL DEFAULT 0,
    "receptions" INTEGER NOT NULL DEFAULT 0,
    "recYards" INTEGER NOT NULL DEFAULT 0,
    "recTDs" INTEGER NOT NULL DEFAULT 0,
    "tackles" INTEGER NOT NULL DEFAULT 0,
    "sacks" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "forcedFumbles" INTEGER NOT NULL DEFAULT 0,
    "defInterceptions" INTEGER NOT NULL DEFAULT 0,
    "passBreakups" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "PlayerSeasonStat_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SpotlightPlayer" (
    "id" TEXT NOT NULL,
    "seasonId" TEXT NOT NULL,
    "playerId" TEXT NOT NULL,
    "teamId" TEXT NOT NULL,
    "narrative" TEXT,
    "assignedTrait" TEXT,

    CONSTRAINT "SpotlightPlayer_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TeamRanking" (
    "id" TEXT NOT NULL,
    "seasonId" TEXT NOT NULL,
    "teamId" TEXT NOT NULL,
    "week" INTEGER NOT NULL,
    "apRank" INTEGER,
    "cfpRank" INTEGER,
    "record" TEXT NOT NULL,

    CONSTRAINT "TeamRanking_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PlayerAward" (
    "id" TEXT NOT NULL,
    "playerId" TEXT NOT NULL,
    "seasonId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "week" INTEGER,
    "gameId" TEXT,

    CONSTRAINT "PlayerAward_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "NewsItem" (
    "id" TEXT NOT NULL,
    "seasonId" TEXT NOT NULL,
    "teamId" TEXT,
    "week" INTEGER NOT NULL,
    "category" TEXT NOT NULL,
    "headline" TEXT NOT NULL,
    "body" TEXT NOT NULL,
    "playerId" TEXT,
    "gameId" TEXT,
    "isBreaking" BOOLEAN NOT NULL DEFAULT false,
    "isNational" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "NewsItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UserDynasty" (
    "id" TEXT NOT NULL,
    "teamId" TEXT NOT NULL,
    "dynastyName" TEXT NOT NULL,
    "currentYear" INTEGER NOT NULL,
    "currentWeek" INTEGER NOT NULL DEFAULT 0,
    "totalWins" INTEGER NOT NULL DEFAULT 0,
    "totalLosses" INTEGER NOT NULL DEFAULT 0,
    "titles" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "UserDynasty_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "PlayerTrait_playerId_trait_key" ON "PlayerTrait"("playerId", "trait");

-- CreateIndex
CREATE UNIQUE INDEX "ScholarshipOffer_recruitId_teamId_key" ON "ScholarshipOffer"("recruitId", "teamId");

-- CreateIndex
CREATE UNIQUE INDEX "RecruitingInterest_recruitId_teamId_key" ON "RecruitingInterest"("recruitId", "teamId");

-- CreateIndex
CREATE UNIQUE INDEX "CoachSeason_coachId_seasonId_key" ON "CoachSeason"("coachId", "seasonId");

-- CreateIndex
CREATE UNIQUE INDEX "Season_year_key" ON "Season"("year");

-- CreateIndex
CREATE UNIQUE INDEX "TeamSeason_teamId_seasonId_key" ON "TeamSeason"("teamId", "seasonId");

-- CreateIndex
CREATE UNIQUE INDEX "PlayerGameStat_gameId_playerId_key" ON "PlayerGameStat"("gameId", "playerId");

-- CreateIndex
CREATE UNIQUE INDEX "PlayerSeasonStat_playerId_seasonId_key" ON "PlayerSeasonStat"("playerId", "seasonId");

-- CreateIndex
CREATE UNIQUE INDEX "SpotlightPlayer_seasonId_playerId_key" ON "SpotlightPlayer"("seasonId", "playerId");

-- CreateIndex
CREATE UNIQUE INDEX "TeamRanking_seasonId_teamId_week_key" ON "TeamRanking"("seasonId", "teamId", "week");

-- CreateIndex
CREATE UNIQUE INDEX "UserDynasty_teamId_key" ON "UserDynasty"("teamId");

-- AddForeignKey
ALTER TABLE "Team" ADD CONSTRAINT "Team_conferenceId_fkey" FOREIGN KEY ("conferenceId") REFERENCES "Conference"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Player" ADD CONSTRAINT "Player_teamId_fkey" FOREIGN KEY ("teamId") REFERENCES "Team"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PlayerTrait" ADD CONSTRAINT "PlayerTrait_playerId_fkey" FOREIGN KEY ("playerId") REFERENCES "Player"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PlayerDevEvent" ADD CONSTRAINT "PlayerDevEvent_playerId_fkey" FOREIGN KEY ("playerId") REFERENCES "Player"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ScholarshipOffer" ADD CONSTRAINT "ScholarshipOffer_recruitId_fkey" FOREIGN KEY ("recruitId") REFERENCES "Recruit"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ScholarshipOffer" ADD CONSTRAINT "ScholarshipOffer_teamId_fkey" FOREIGN KEY ("teamId") REFERENCES "Team"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RecruitingInterest" ADD CONSTRAINT "RecruitingInterest_recruitId_fkey" FOREIGN KEY ("recruitId") REFERENCES "Recruit"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RecruitingInterest" ADD CONSTRAINT "RecruitingInterest_teamId_fkey" FOREIGN KEY ("teamId") REFERENCES "Team"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RecruitVisit" ADD CONSTRAINT "RecruitVisit_recruitId_fkey" FOREIGN KEY ("recruitId") REFERENCES "Recruit"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RecruitTimeline" ADD CONSTRAINT "RecruitTimeline_recruitId_fkey" FOREIGN KEY ("recruitId") REFERENCES "Recruit"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Coach" ADD CONSTRAINT "Coach_teamId_fkey" FOREIGN KEY ("teamId") REFERENCES "Team"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CoachHistory" ADD CONSTRAINT "CoachHistory_coachId_fkey" FOREIGN KEY ("coachId") REFERENCES "Coach"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CoachHistory" ADD CONSTRAINT "CoachHistory_teamId_fkey" FOREIGN KEY ("teamId") REFERENCES "Team"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CoachSeason" ADD CONSTRAINT "CoachSeason_coachId_fkey" FOREIGN KEY ("coachId") REFERENCES "Coach"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CoachSeason" ADD CONSTRAINT "CoachSeason_seasonId_fkey" FOREIGN KEY ("seasonId") REFERENCES "Season"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TeamSeason" ADD CONSTRAINT "TeamSeason_teamId_fkey" FOREIGN KEY ("teamId") REFERENCES "Team"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TeamSeason" ADD CONSTRAINT "TeamSeason_seasonId_fkey" FOREIGN KEY ("seasonId") REFERENCES "Season"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Game" ADD CONSTRAINT "Game_seasonId_fkey" FOREIGN KEY ("seasonId") REFERENCES "Season"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Game" ADD CONSTRAINT "Game_homeTeamId_fkey" FOREIGN KEY ("homeTeamId") REFERENCES "Team"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Game" ADD CONSTRAINT "Game_awayTeamId_fkey" FOREIGN KEY ("awayTeamId") REFERENCES "Team"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GameDrive" ADD CONSTRAINT "GameDrive_gameId_fkey" FOREIGN KEY ("gameId") REFERENCES "Game"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PlayerGameStat" ADD CONSTRAINT "PlayerGameStat_gameId_fkey" FOREIGN KEY ("gameId") REFERENCES "Game"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PlayerGameStat" ADD CONSTRAINT "PlayerGameStat_playerId_fkey" FOREIGN KEY ("playerId") REFERENCES "Player"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PlayerSeasonStat" ADD CONSTRAINT "PlayerSeasonStat_playerId_fkey" FOREIGN KEY ("playerId") REFERENCES "Player"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PlayerSeasonStat" ADD CONSTRAINT "PlayerSeasonStat_seasonId_fkey" FOREIGN KEY ("seasonId") REFERENCES "Season"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SpotlightPlayer" ADD CONSTRAINT "SpotlightPlayer_seasonId_fkey" FOREIGN KEY ("seasonId") REFERENCES "Season"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SpotlightPlayer" ADD CONSTRAINT "SpotlightPlayer_playerId_fkey" FOREIGN KEY ("playerId") REFERENCES "Player"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TeamRanking" ADD CONSTRAINT "TeamRanking_seasonId_fkey" FOREIGN KEY ("seasonId") REFERENCES "Season"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PlayerAward" ADD CONSTRAINT "PlayerAward_playerId_fkey" FOREIGN KEY ("playerId") REFERENCES "Player"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "NewsItem" ADD CONSTRAINT "NewsItem_seasonId_fkey" FOREIGN KEY ("seasonId") REFERENCES "Season"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "NewsItem" ADD CONSTRAINT "NewsItem_playerId_fkey" FOREIGN KEY ("playerId") REFERENCES "Player"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserDynasty" ADD CONSTRAINT "UserDynasty_teamId_fkey" FOREIGN KEY ("teamId") REFERENCES "Team"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

