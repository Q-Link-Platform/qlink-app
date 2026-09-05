import { PrismaClient as AttachPrismaClient } from "./generated/attachmentsClient";

const globalForAttachPrisma = globalThis as unknown as {
  prismaAttachments?: AttachPrismaClient;
};

function getAttachDatabaseUrl(): string | undefined {
  const url = process.env.ATTACH_DATABASE_URL || process.env.DATABASE_URL;
  if (!url) return undefined;

  let cleanUrl = url
    .replace("&channel_binding=require", "")
    .replace("?channel_binding=require&", "?")
    .replace("?channel_binding=require", "");

  if (!cleanUrl.includes("connect_timeout=")) {
    cleanUrl += cleanUrl.includes("?") ? "&connect_timeout=10" : "?connect_timeout=10";
  }
  if (!cleanUrl.includes("pool_timeout=")) {
    cleanUrl += "&pool_timeout=10";
  }
  return cleanUrl;
}

const attachDatabaseUrl = getAttachDatabaseUrl();

export const prismaAttachments =
  globalForAttachPrisma.prismaAttachments ??
  new AttachPrismaClient({
    datasources: attachDatabaseUrl ? { db: { url: attachDatabaseUrl } } : undefined,
    log: process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"],
  });

if (process.env.NODE_ENV !== "production") {
  globalForAttachPrisma.prismaAttachments = prismaAttachments;
}

