export const dynamic = "force-dynamic";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function POST(req: Request) {
  const { teamId } = await req.json();
  if (!teamId) return NextResponse.json({ error: "teamId required" }, { status: 400 });

  try {
    const team = await prisma.team.findUnique({ where: { id: teamId } });
    if (!team) return NextResponse.json({ error: "Team not found" }, { status: 404 });

    // Upsert dynasty
    const dynasty = await prisma.userDynasty.upsert({
      where: { teamId },
      update: {},
      create: {
        teamId,
        dynastyName: `${team.name} Dynasty`,
        currentYear: 2025,
        currentWeek: 0,
      },
    });

    // Ensure season exists
    const season = await prisma.season.upsert({
      where: { year: 2025 },
      update: {},
      create: { year: 2025, currentWeek: 0, phase: "PRESEASON" },
    });

    // Ensure team season exists
    await prisma.teamSeason.upsert({
      where: { teamId_seasonId: { teamId, seasonId: season.id } },
      update: {},
      create: { teamId, seasonId: season.id },
    });

    return NextResponse.json({ success: true, dynastyId: dynasty.id });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Failed to start dynasty" }, { status: 500 });
  }
}
