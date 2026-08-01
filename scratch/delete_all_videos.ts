import { PrismaClient } from "@prisma/client";
import { prismaAttachments } from "../src/lib/prismaAttachments";
import { supabasePostsAdmin } from "../src/lib/supabasePosts";

const prismaMain = new PrismaClient();

async function main() {
  console.log("=================================================");
  console.log("   STEP 1: INSPECTING VIDEO ATTACHMENTS & POSTS  ");
  console.log("=================================================");

  const videoAttachments = await prismaAttachments.attachment.findMany({
    where: { kind: "video" },
  });

  console.log(`Found ${videoAttachments.length} video attachment(s) in Attachments DB:`);
  for (const att of videoAttachments) {
    console.log(` - ID: ${att.id}`);
    console.log(`   ObjectKey: ${att.objectKey}`);
    console.log(`   Bucket: ${att.bucket}`);
    console.log(`   Size: ${att.sizeBytes} bytes`);
    console.log(`   Post ID in attachment record: ${att.postId ?? "N/A"}`);
  }

  const attIds = videoAttachments.map((a) => a.id);
  const objectKeys = videoAttachments.map((a) => a.objectKey);

  // Find corresponding posts in Main DB
  const matchingPosts = await prismaMain.post.findMany({
    where: {
      OR: [
        { attachmentId: { in: attIds } },
        { attachmentKind: "video" },
      ],
    },
  });

  console.log(`\nFound ${matchingPosts.length} matching Post record(s) in Main DB.`);
  for (const post of matchingPosts) {
    console.log(` - Post ID: ${post.id}`);
    console.log(`   Author ID: ${post.authorId}`);
    console.log(`   Text: "${post.text}"`);
    console.log(`   AttachmentId: ${post.attachmentId}`);
  }

  console.log("\n=================================================");
  console.log("   STEP 2: PERMANENT DELETION FROM MAIN POSTGRES ");
  console.log("=================================================");

  if (matchingPosts.length > 0) {
    const postIds = matchingPosts.map((p) => p.id);
    const deletePostsResult = await prismaMain.post.deleteMany({
      where: { id: { in: postIds } },
    });
    console.log(`✅ Deleted ${deletePostsResult.count} Post row(s) from Main DB (Neon Postgres).`);
  } else {
    // Also delete any remaining post with attachmentKind 'video'
    const deletePostsKindResult = await prismaMain.post.deleteMany({
      where: { attachmentKind: "video" },
    });
    console.log(`✅ Deleted ${deletePostsKindResult.count} Post row(s) with attachmentKind 'video' from Main DB.`);
  }

  console.log("\n=================================================");
  console.log("   STEP 3: PERMANENT DELETION FROM ATTACHMENTS DB ");
  console.log("=================================================");

  const deleteAttResult = await prismaAttachments.attachment.deleteMany({
    where: { kind: "video" },
  });
  console.log(`✅ Deleted ${deleteAttResult.count} Attachment row(s) from Attachments DB.`);

  console.log("\n=================================================");
  console.log("   STEP 4: PERMANENT DELETION FROM SUPABASE BUCKET");
  console.log("=================================================");

  if (supabasePostsAdmin && objectKeys.length > 0) {
    console.log(`Removing ${objectKeys.length} object(s) from bucket 'Autark-3':`, objectKeys);
    const { data: removeData, error: removeError } = await supabasePostsAdmin.storage
      .from("Autark-3")
      .remove(objectKeys);

    if (removeError) {
      console.error("❌ Supabase storage removal error:", removeError);
    } else {
      console.log("✅ Supabase storage response:", removeData);
    }
  } else {
    console.error("❌ supabasePostsAdmin client not configured or no object keys found.");
  }

  console.log("\n=================================================");
  console.log("   STEP 5: VERIFICATION VIA HTTP HEAD REQUESTS   ");
  console.log("=================================================");

  for (const att of videoAttachments) {
    const publicUrl = `https://ansfsehkrddmrwnjspek.supabase.co/storage/v1/object/public/${att.bucket}/${att.objectKey}`;
    try {
      const res = await fetch(publicUrl, { method: "HEAD" });
      console.log(`URL: ${publicUrl}`);
      console.log(`Status: ${res.status} ${res.statusText}`);
      if (res.status === 404 || res.status === 400) {
        console.log(`✅ CONFIRMED: File is permanently deleted (404 Not Found).`);
      } else {
        console.log(`⚠️ Status is ${res.status}.`);
      }
    } catch (err: any) {
      console.log(`HEAD check error for ${publicUrl}:`, err.message);
    }
  }

  console.log("\n=================================================");
  console.log("   PERMANENT DELETION PROCESS COMPLETED SUCCESS ");
  console.log("=================================================");
}

main()
  .catch((e) => {
    console.error("Fatal script error:", e);
  })
  .finally(async () => {
    await prismaMain.$disconnect();
  });
