export const dynamic = "force-dynamic";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET(_req: Request, { params }: { params: Promise<{ teamId: string }> }) {
  const { teamId } = await params;
  try {
    const dynasty = await prisma.userDynasty.findUnique({ where: { teamId } });
    if (!dynasty) return NextResponse.json([]);

    const season = await prisma.season.findUnique({ where: { year: dynasty.currentYear } });
    if (!season) return NextResponse.json([]);

    const spotlights = await prisma.spotlightPlayer.findMany({
      where: { seasonId: season.id, teamId },
      include: {
        player: {
          include: { traits: true },
        },
      },
    });

    return NextResponse.json(spotlights);
  } catch {
    return NextResponse.json([]);
  }
}
