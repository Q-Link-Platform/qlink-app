import { PrismaClient } from "@prisma/client";
import { PrismaClient as PrismaAttachmentsClient } from "../src/lib/generated/attachmentsClient";
import { supabasePosts, supabasePostsAdmin } from "../src/lib/supabasePosts";
import fs from "fs";

const prisma = new PrismaClient();
const prismaAttachments = new PrismaAttachmentsClient();

async function checkVideoFile() {
  console.log("=== INSPECTING RAW VIDEO FILE ATTACHMENT ===");

  const post = await prisma.post.findFirst({
    where: { attachmentKind: "video" },
    orderBy: { createdAt: "desc" },
  });

  if (!post || !post.attachmentId) {
    console.log("No video post found.");
    return;
  }

  const att = await prismaAttachments.attachment.findUnique({
    where: { id: post.attachmentId },
  });

  console.log("Post ID:", post.id);
  console.log("Attachment:", att);

  if (!att) return;

  const client = supabasePostsAdmin || supabasePosts;
  if (!client) {
    console.log("No Supabase client available");
    return;
  }

  const { data, error } = await client.storage.from(att.bucket).download(att.objectKey);
  if (error || !data) {
    console.error("Failed to download video from Supabase:", error);
    return;
  }

  const buffer = Buffer.from(await data.arrayBuffer());
  console.log(`Successfully downloaded ${buffer.length} bytes!`);

  // Inspect first 64 bytes for MP4 ftype atom / header
  const hexHeader = buffer.slice(0, 64).toString("hex");
  const asciiHeader = buffer.slice(0, 64).toString("ascii").replace(/[^\x20-\x7E]/g, ".");
  console.log("Hex Header (first 64 bytes):", hexHeader);
  console.log("ASCII Header:", asciiHeader);

  // Check for ftyp atom
  if (asciiHeader.includes("ftyp")) {
    console.log("✅ Valid ftyp atom found in header!");
  } else {
    console.log("⚠️ WARNING: ftyp atom missing from file header!");
  }
}

checkVideoFile()
  .catch((e) => console.error(e))
  .finally(async () => {
    await prisma.$disconnect();
    await prismaAttachments.$disconnect();
  });
