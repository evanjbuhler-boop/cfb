export const dynamic = "force-dynamic";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET(_req: Request, { params }: { params: Promise<{ teamId: string }> }) {
  const { teamId } = await params;
  try {
    const [coach, dynasty] = await Promise.all([
      prisma.coach.findFirst({ where: { teamId, role: "HEAD_COACH" } }),
      prisma.userDynasty.findUnique({ where: { teamId } }),
    ]);
    if (!coach) return NextResponse.json({ error: "No coach" }, { status: 404 });

    const season = dynasty ? await prisma.season.findUnique({ where: { year: dynasty.currentYear } }) : null;
    const teamSeason = season ? await prisma.teamSeason.findUnique({
      where: { teamId_seasonId: { teamId, seasonId: season.id } },
    }) : null;

    return NextResponse.json({
      ...coach,
      seasonRecord: { wins: teamSeason?.wins ?? 0, losses: teamSeason?.losses ?? 0 },
    });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}
