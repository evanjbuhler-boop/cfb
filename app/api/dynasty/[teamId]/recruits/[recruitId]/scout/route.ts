export const dynamic = "force-dynamic";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { rng } from "@/lib/utils";

export async function POST(_req: Request, { params }: { params: Promise<{ teamId: string; recruitId: string }> }) {
  const { teamId, recruitId } = await params;
  try {
    const recruit = await prisma.recruit.findUnique({ where: { id: recruitId } });
    if (!recruit) return NextResponse.json({ error: "Not found" }, { status: 404 });

    // Scouting reveals partial hidden data and boosts interest
    const scoutingData = JSON.parse(recruit.scoutingData || "{}");
    const scoutPoints = (scoutingData[teamId] || 0) + rng(5, 15);
    scoutingData[teamId] = scoutPoints;

    await prisma.recruit.update({
      where: { id: recruitId },
      data: { scoutingData: JSON.stringify(scoutingData) },
    });

    // Boost recruiting interest
    const dynasty = await prisma.userDynasty.findUnique({ where: { teamId } });
    const team = await prisma.team.findUnique({ where: { id: teamId } });

    // Interest gain depends on prestige match
    const prestigeBonus = team ? Math.floor(team.prestige * 0.5) : 0;
    const gain = rng(3, 8) + prestigeBonus;

    await prisma.recruitingInterest.upsert({
      where: { recruitId_teamId: { recruitId, teamId } },
      update: { interestLevel: { increment: gain }, pointsInvested: { increment: scoutPoints } },
      create: { recruitId, teamId, interestLevel: gain, pointsInvested: scoutPoints, updatedAt: new Date() },
    });

    if (dynasty && recruit.stars >= 4) {
      await prisma.newsItem.create({
        data: {
          seasonId: (await prisma.season.findUnique({ where: { year: dynasty.currentYear } }))?.id || "",
          teamId,
          week: dynasty.currentWeek,
          category: "RECRUITING",
          headline: `INTEL: ${recruit.stars}-STAR ${recruit.position} ${recruit.firstName.toUpperCase()} ${recruit.lastName.toUpperCase()} SCOUTED`,
          body: `Your scouts have a full report on ${recruit.firstName} ${recruit.lastName}. The ${recruit.stars}-star ${recruit.position} out of ${recruit.hometown} is a legitimate target.`,
        },
      });
    }

    return NextResponse.json({ success: true, scoutPoints });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}
