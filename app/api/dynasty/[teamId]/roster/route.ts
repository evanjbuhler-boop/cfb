import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET(_req: Request, { params }: { params: Promise<{ teamId: string }> }) {
  const { teamId } = await params;
  try {
    const players = await prisma.player.findMany({
      where: { teamId },
      include: { traits: true },
      orderBy: [{ overall: "desc" }],
    });
    return NextResponse.json(players);
  } catch {
    return NextResponse.json([]);
  }
}
