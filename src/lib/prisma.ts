import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as {
  prisma?: PrismaClient;
};

// Ensure Neon serverless connection parameters are configured with adequate cold-start timeout
function getDatabaseUrl(): string | undefined {
  const url = process.env.DATABASE_URL;
  if (!url) return undefined;
  
  // Strip problematic channel_binding if present and append connect_timeout
  let cleanUrl = url
    .replace("&channel_binding=require", "")
    .replace("?channel_binding=require&", "?")
    .replace("?channel_binding=require", "");

  if (!cleanUrl.includes("connect_timeout=")) {
    cleanUrl += cleanUrl.includes("?") ? "&connect_timeout=30" : "?connect_timeout=30";
  }
  if (!cleanUrl.includes("pool_timeout=")) {
    cleanUrl += "&pool_timeout=30";
  }
  return cleanUrl;
}

const databaseUrl = getDatabaseUrl();

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    datasources: databaseUrl ? { db: { url: databaseUrl } } : undefined,
    log: process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"],
  });

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}
