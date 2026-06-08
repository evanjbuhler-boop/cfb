export const dynamic = "force-dynamic";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function POST(_req: Request, { params }: { params: Promise<{ teamId: string; recruitId: string }> }) {
  const { teamId, recruitId } = await params;
  try {
    await prisma.scholarshipOffer.upsert({
      where: { recruitId_teamId: { recruitId, teamId } },
      update: { withdrawn: false },
      create: { recruitId, teamId },
    });

    // Boost interest slightly when offered
    await prisma.recruitingInterest.upsert({
      where: { recruitId_teamId: { recruitId, teamId } },
      update: { interestLevel: { increment: 10 } },
      create: { recruitId, teamId, interestLevel: 10, updatedAt: new Date() },
    });

    // Timeline entry
    const team = await prisma.team.findUnique({ where: { id: teamId } });
    const dynasty = await prisma.userDynasty.findUnique({ where: { teamId } });
    await prisma.recruitTimeline.create({
      data: {
        recruitId, event: `Offered by ${team?.name || "Unknown"}`,
        teamId, teamName: team?.name, week: dynasty?.currentWeek || 0, season: dynasty?.currentYear || 2025,
      },
    });

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}
