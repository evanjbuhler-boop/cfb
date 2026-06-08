import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET(_req: Request, { params }: { params: Promise<{ teamId: string }> }) {
  const { teamId } = await params;
  try {
    const dynasty = await prisma.userDynasty.findUnique({ where: { teamId } });
    const enrollYear = dynasty ? dynasty.currentYear + 1 : 2026;

    const recruits = await prisma.recruit.findMany({
      where: { enrollYear },
      include: {
        interests: { where: { teamId } },
        offers: { where: { teamId, withdrawn: false } },
      },
      orderBy: { nationalRank: "asc" },
      take: 300,
    });

    return NextResponse.json(recruits);
  } catch (err) {
    console.error(err);
    return NextResponse.json([]);
  }
}
