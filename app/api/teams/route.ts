export const dynamic = "force-dynamic";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET() {
  try {
    const teams = await prisma.team.findMany({
      include: { conference: true },
      orderBy: [{ prestige: "desc" }, { name: "asc" }],
    });
    return NextResponse.json(teams);
  } catch {
    return NextResponse.json([], { status: 200 });
  }
}
