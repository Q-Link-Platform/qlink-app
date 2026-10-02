import { prismaAttachments } from "../src/lib/prismaAttachments";
import { supabasePostsAdmin } from "../src/lib/supabasePosts";

async function main() {
  console.log("=== INSPECTING VIDEO POSTS IN DB ===");
  
  const videoAttachments = await prismaAttachments.attachment.findMany({
    where: { kind: "video" },
    orderBy: { createdAt: "desc" },
    take: 10,
  });

  console.log(`Found ${videoAttachments.length} video attachments:`);
  for (const att of videoAttachments) {
    console.log(`\nID: ${att.id}`);
    console.log(`ObjectKey: ${att.objectKey}`);
    console.log(`Bucket: ${att.bucket}`);
    console.log(`Status: ${att.status}`);
    console.log(`MimeType: ${att.mimeType}`);
    console.log(`SizeBytes: ${att.sizeBytes}`);
    console.log(`CreatedAt: ${att.createdAt}`);

    if (supabasePostsAdmin && att.bucket && att.objectKey) {
      // Check if object exists in Supabase bucket
      const publicUrlData = supabasePostsAdmin.storage
        .from(att.bucket)
        .getPublicUrl(att.objectKey);
      
      console.log(`Public URL: ${publicUrlData.data.publicUrl}`);

      try {
        const res = await fetch(publicUrlData.data.publicUrl, { method: "HEAD" });
        console.log(`HEAD status: ${res.status} ${res.statusText}`);
        console.log(`Content-Type: ${res.headers.get("content-type")}`);
        console.log(`Content-Length: ${res.headers.get("content-length")}`);
        console.log(`Accept-Ranges: ${res.headers.get("accept-ranges")}`);
      } catch (err: any) {
        console.error(`HEAD request failed: ${err.message}`);
      }
    }
  }
}

main().catch(console.error);
