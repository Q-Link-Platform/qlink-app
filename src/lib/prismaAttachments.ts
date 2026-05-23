import { PrismaClient as AttachPrismaClient } from "./generated/attachmentsClient";

declare global {
  // eslint-disable-next-line no-var
  var prismaAttachments: AttachPrismaClient | undefined;
}

const client =
  global.prismaAttachments ?? new AttachPrismaClient();

if (process.env.NODE_ENV !== "production") {
  global.prismaAttachments = client;
}

export const prismaAttachments = client;
