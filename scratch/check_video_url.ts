/**
 * Fullproof video URL + CORS + stream diagnostic
 * Checks the exact URL the feed API returns, fetches it, and verifies byte streaming.
 */
import { PrismaClient } from "@prisma/client";
import { PrismaClient as PrismaAttachmentsClient } from "../src/lib/generated/attachmentsClient";
import { supabasePosts, supabasePostsAdmin } from "../src/lib/supabasePosts";

const prisma = new PrismaClient();
const prismaAttachments = new PrismaAttachmentsClient();

async function checkVideoUrls() {
  console.log("=== VIDEO URL DIAGNOSTIC ===\n");

  const posts = await prisma.post.findMany({
    where: { attachmentKind: "video" },
    orderBy: { createdAt: "desc" },
    take: 5,
  });

  const client = supabasePostsAdmin || supabasePosts;
  if (!client) { console.error("No Supabase client!"); return; }

  for (const post of posts) {
    if (!post.attachmentId) { console.log(`Post ${post.id}: NO attachmentId`); continue; }

    const att = await prismaAttachments.attachment.findUnique({ where: { id: post.attachmentId } });
    if (!att) { console.log(`Post ${post.id}: attachment record MISSING`); continue; }

    console.log(`\nPost ID: ${post.id}`);
    console.log(`  Attachment status: ${att.status}`);
    console.log(`  Bucket: ${att.bucket} | Key: ${att.objectKey}`);

    // 1. Check public URL
    const { data: pub } = client.storage.from(att.bucket).getPublicUrl(att.objectKey);
    const publicUrl = pub?.publicUrl;
    console.log(`  Public URL: ${publicUrl}`);

    // 2. Check if the object actually exists in storage
    const { data: listed, error: listErr } = await client.storage
      .from(att.bucket)
      .list(att.objectKey.split("/")[0], { search: att.objectKey.split("/")[1] });
    
    if (listErr) {
      console.log(`  Storage list error: ${listErr.message}`);
    } else if (!listed || listed.length === 0) {
      console.log(`  ⚠️  OBJECT NOT FOUND IN STORAGE BUCKET!`);
    } else {
      console.log(`  ✅ Object exists in storage: ${listed[0].name}, size: ${listed[0].metadata?.size}`);
    }

    // 3. Fetch public URL and check headers
    if (publicUrl) {
      try {
        const resp = await fetch(publicUrl, { method: "HEAD" });
        console.log(`  HEAD ${resp.status} ${resp.statusText}`);
        console.log(`    content-type: ${resp.headers.get("content-type")}`);
        console.log(`    content-length: ${resp.headers.get("content-length")}`);
        console.log(`    accept-ranges: ${resp.headers.get("accept-ranges")}`);
        console.log(`    access-control-allow-origin: ${resp.headers.get("access-control-allow-origin")}`);
        console.log(`    cache-control: ${resp.headers.get("cache-control")}`);

        if (resp.status === 400 || resp.status === 404) {
          console.log(`  ⚠️  URL RETURNS ${resp.status} - FILE NOT ACCESSIBLE!`);
        }
      } catch (e: any) {
        console.log(`  fetch error: ${e.message}`);
      }

      // 4. Try range request
      try {
        const rangeResp = await fetch(publicUrl, { headers: { Range: "bytes=0-100" } });
        console.log(`  Range GET ${rangeResp.status} ${rangeResp.statusText}`);
        if (rangeResp.status === 206) {
          console.log(`  ✅ Range streaming works!`);
        } else if (rangeResp.status === 200) {
          console.log(`  ⚠️  Server returned 200 for range request (byte-range not supported?)`);
        } else {
          console.log(`  ❌ Range request FAILED with ${rangeResp.status}`);
        }
      } catch (e: any) {
        console.log(`  Range fetch error: ${e.message}`);
      }
    }

    // 5. Check if DB attachment status is 'pending' (upload not completed)
    if (att.status === "pending") {
      console.log(`  ⚠️  ATTACHMENT STATUS IS 'pending' - upload may not have been confirmed!`);
    }
  }

  // 6. Check if the URL that feed API returns is correct
  console.log("\n\n=== SIMULATING FEED API RESPONSE ===");
  for (const post of posts) {
    if (!post.attachmentId) continue;
    const att = await prismaAttachments.attachment.findUnique({ where: { id: post.attachmentId } });
    if (!att) continue;
    
    // This is what /api/posts/route.ts returns
    const { data: pub } = client.storage.from(att.bucket).getPublicUrl(att.objectKey);
    const mediaUrl = pub?.publicUrl;
    
    console.log(`\nPost ${post.id} => media.url = "${mediaUrl}"`);
    console.log(`  This URL will be passed to <video src={...}>`);
  }
}

checkVideoUrls()
  .catch((e) => console.error(e))
  .finally(async () => {
    await prisma.$disconnect();
    await prismaAttachments.$disconnect();
  });
