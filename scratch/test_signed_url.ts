import { supabasePostsAdmin, supabasePosts } from "../src/lib/supabasePosts";
import { prismaAttachments } from "../src/lib/prismaAttachments";

async function main() {
  const atts = await prismaAttachments.attachment.findMany({
    where: { kind: "video" },
    orderBy: { createdAt: "desc" },
    take: 5,
  });

  const client = supabasePostsAdmin || supabasePosts;
  if (!client) {
    console.log("No supabase client");
    return;
  }

  for (const att of atts) {
    console.log(`\n=== Attachment ${att.id} ===`);
    console.log(`Bucket: ${att.bucket}, ObjectKey: ${att.objectKey}`);

    const pub = client.storage.from(att.bucket).getPublicUrl(att.objectKey);
    console.log(`Public URL: ${pub.data?.publicUrl}`);

    const signed = await client.storage.from(att.bucket).createSignedUrl(att.objectKey, 60 * 60 * 24);
    console.log(`Signed URL: ${signed.data?.signedUrl}`);

    if (signed.data?.signedUrl) {
      try {
        const res = await fetch(signed.data.signedUrl, { method: "HEAD" });
        console.log(`Signed HEAD status: ${res.status} ${res.statusText}`);
      } catch (err: any) {
        console.error("Signed HEAD error:", err.message);
      }
    }
  }
}

main().catch(console.error);
