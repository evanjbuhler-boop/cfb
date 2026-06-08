export const dynamic = "force-dynamic";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

const ARCS = [
  "All eyes on him this season — can he deliver when it matters most?",
  "The breakout is coming. Everyone on the staff says so.",
  "He arrived as a question mark. He leaves as a statement.",
  "Quietly building something special. Watch for the moment it clicks.",
  "Counted out, but never counted himself out. His time is now.",
  "The spotlight doesn't faze him. He was built for it.",
];

export async function POST(_req: Request, { params }: { params: Promise<{ teamId: string; playerId: string }> }) {
  const { teamId, playerId } = await params;
  try {
    const dynasty = await prisma.userDynasty.findUnique({ where: { teamId } });
    if (!dynasty) return NextResponse.json({ error: "No dynasty" }, { status: 404 });
    const season = await prisma.season.findUnique({ where: { year: dynasty.currentYear } });
    if (!season) return NextResponse.json({ error: "No season" }, { status: 404 });

    const narrative = ARCS[Math.floor(Math.random() * ARCS.length)];
    const spotlight = await prisma.spotlightPlayer.upsert({
      where: { seasonId_playerId: { seasonId: season.id, playerId } },
      update: {},
      create: { seasonId: season.id, playerId, teamId, narrative },
    });
    return NextResponse.json(spotlight);
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ teamId: string; playerId: string }> }) {
  const { teamId, playerId } = await params;
  try {
    const dynasty = await prisma.userDynasty.findUnique({ where: { teamId } });
    if (!dynasty) return NextResponse.json({ error: "No dynasty" }, { status: 404 });
    const season = await prisma.season.findUnique({ where: { year: dynasty.currentYear } });
    if (!season) return NextResponse.json({ error: "No season" }, { status: 404 });

    await prisma.spotlightPlayer.deleteMany({
      where: { seasonId: season.id, playerId, teamId },
    });
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}
