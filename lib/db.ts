import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";

declare global {
  // eslint-disable-next-line no-var
  var _prisma: PrismaClient | undefined;
}

function createClient(): PrismaClient {
  if (global._prisma) return global._prisma;
  const pool = new Pool({ connectionString: process.env.DATABASE_URL });
  const adapter = new PrismaPg(pool);
  const client = new PrismaClient({
    adapter,
    log: process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"],
  });
  if (process.env.NODE_ENV !== "production") global._prisma = client;
  return client;
}

// Proxy defers client creation until first property access (inside a request handler).
// This prevents Next.js from instantiating PrismaClient during the build phase.
export const prisma = new Proxy({} as PrismaClient, {
  get(_, prop) {
    return (createClient() as unknown as Record<string | symbol, unknown>)[prop];
  },
});
