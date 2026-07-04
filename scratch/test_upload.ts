import { supabasePostsAdmin } from '../src/lib/supabasePosts';
import { prismaAttachments } from '../src/lib/prismaAttachments';
import crypto from 'crypto';

async function main() {
  console.log("Starting upload test...");
  
  if (!supabasePostsAdmin) {
    console.error("supabasePostsAdmin is null!");
    return;
  }

  const bucket = process.env.SUPABASE_POSTS_BUCKET;
  if (!bucket) {
    console.error("SUPABASE_POSTS_BUCKET is not set!");
    return;
  }

  console.log("Bucket:", bucket);
  const objectKey = `images/test-${crypto.randomUUID()}.txt`;
  console.log("Uploading dummy text to key:", objectKey);

  const buffer = Buffer.from("Hello world test upload");
  
  const uploadResult = await supabasePostsAdmin.storage
    .from(bucket)
    .upload(objectKey, buffer, {
      cacheControl: "3600",
      upsert: false,
      contentType: "text/plain",
    });

  if (uploadResult.error) {
    console.error("Supabase upload failed:", uploadResult.error);
    return;
  }

  console.log("Supabase upload succeeded!", uploadResult.data);

  console.log("Creating attachment in secondary DB...");
  const attachment = await prismaAttachments.attachment.create({
    data: {
      messageId: null,
      roomId: null,
      senderId: "test-user-id",
      postId: null,
      kind: "image",
      bucket,
      objectKey,
      originalName: "test.txt",
      mimeType: "text/plain",
      sizeBytes: BigInt(buffer.length),
      status: "uploaded",
    }
  });

  console.log("Attachment created successfully:", attachment);
}

main().catch(err => {
  console.error("Unhandled error in test:", err);
});
