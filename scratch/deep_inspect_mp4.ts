import { PrismaClient } from "@prisma/client";
import { PrismaClient as PrismaAttachmentsClient } from "../src/lib/generated/attachmentsClient";
import { supabasePosts, supabasePostsAdmin } from "../src/lib/supabasePosts";

const prisma = new PrismaClient();
const prismaAttachments = new PrismaAttachmentsClient();

async function deepInspectMp4() {
  console.log("==================================================");
  console.log("=== FULLPROOF DEEP MP4 BINARY ATOM DIAGNOSTIC ===");
  console.log("==================================================");

  const post = await prisma.post.findUnique({
    where: { id: "cms7gtjli0006z5mjcxs0aozw" },
  });

  if (!post || !post.attachmentId) {
    console.error("Post or attachmentId not found!");
    return;
  }

  const att = await prismaAttachments.attachment.findUnique({
    where: { id: post.attachmentId },
  });

  console.log("POST RECORD IN DB:", {
    postId: post.id,
    authorId: post.authorId,
    text: post.text,
    createdAt: post.createdAt,
    attachmentId: post.attachmentId,
  });

  console.log("\nATTACHMENT RECORD IN DB:", att);

  if (!att) return;

  const client = supabasePostsAdmin || supabasePosts;
  if (!client) {
    console.error("Supabase client not initialized!");
    return;
  }

  console.log(`\nDownloading object from Supabase bucket '${att.bucket}' key '${att.objectKey}'...`);
  const { data, error } = await client.storage.from(att.bucket).download(att.objectKey);

  if (error || !data) {
    console.error("Supabase download error:", error);
    return;
  }

  const arrayBuf = await data.arrayBuffer();
  const buffer = Buffer.from(arrayBuf);

  console.log(`Downloaded file size: ${buffer.length} bytes (${(buffer.length / (1024 * 1024)).toFixed(2)} MB)`);

  // Parse MP4 Atom Boxes
  console.log("\n--- MP4 ATOM BOX STRUCTURE ANALYSIS ---");

  let offset = 0;
  const boxes: { type: string; size: number; offset: number }[] = [];

  while (offset < buffer.length - 8) {
    const size = buffer.readUInt32BE(offset);
    const type = buffer.toString("ascii", offset + 4, offset + 8);

    if (size < 8) break; // Invalid box

    boxes.push({ type, size, offset });

    console.log(`Found Atom Box: type='${type}', size=${size} bytes, offset=${offset} (0x${offset.toString(16)})`);

    if (type === "moov") {
      console.log(`  >>> 'moov' atom found at offset ${offset}! <<<`);
    }

    if (type === "mdat") {
      console.log(`  >>> 'mdat' (media raw bytes) atom found at offset ${offset}! <<<`);
    }

    // Skip to next atom box at top level
    offset += size;
  }

  const moovBox = boxes.find((b) => b.type === "moov");
  const mdatBox = boxes.find((b) => b.type === "mdat");

  console.log("\n--- CRITICAL DIAGNOSTIC FINDINGS ---");
  if (moovBox && mdatBox) {
    if (moovBox.offset > mdatBox.offset) {
      console.log("⚠️ CRITICAL ISSUE: 'moov' atom is placed AFTER 'mdat' atom (at the end of the file)!");
      console.log("  - EXPLANATION: Web browsers REQUIRE the 'moov' (header index) atom at the START of the MP4 file for faststart streaming.");
      console.log("  - IMPACT: Until the browser downloads 100% of all video bytes, duration is 0:00 and video CANNOT play!");
    } else {
      console.log("✅ 'moov' atom is at the START of the file.");
    }
  } else {
    console.log("⚠️ Warning: Could not locate top-level 'moov' or 'mdat' atom.");
  }

  // Check HTTP response headers on signed and public URLs
  const signedRes = await client.storage.from(att.bucket).createSignedUrl(att.objectKey, 3600);
  const publicRes = client.storage.from(att.bucket).getPublicUrl(att.objectKey);

  console.log("\n--- HTTP RESPONSE HEADERS TEST ---");
  if (publicRes.data?.publicUrl) {
    console.log(`Public URL: ${publicRes.data.publicUrl}`);
    const headRes = await fetch(publicRes.data.publicUrl, { method: "HEAD" });
    console.log("HEAD Status:", headRes.status);
    console.log("HEAD Content-Type:", headRes.headers.get("content-type"));
    console.log("HEAD Content-Length:", headRes.headers.get("content-length"));
    console.log("HEAD Accept-Ranges:", headRes.headers.get("accept-ranges"));
  }
}

deepInspectMp4()
  .catch((e) => console.error(e))
  .finally(async () => {
    await prisma.$disconnect();
    await prismaAttachments.$disconnect();
  });
