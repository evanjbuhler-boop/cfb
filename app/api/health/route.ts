export const dynamic = "force-dynamic";
import { seedDatabase } from "@/lib/seed-db";

export async function GET() {
  await seedDatabase();
  return Response.json({ ok: true });
}
