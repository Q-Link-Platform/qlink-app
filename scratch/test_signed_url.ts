import { supabasePostsAdmin } from '../src/lib/supabasePosts';
import crypto from 'crypto';

async function main() {
  console.log("Testing createSignedUploadUrl...");
  
  if (!supabasePostsAdmin) {
    console.error("supabasePostsAdmin is null!");
    return;
  }

  const bucket = process.env.SUPABASE_POSTS_BUCKET || "Autark-3";
  const objectKey = `images/test-sign-${crypto.randomUUID()}.txt`;

  console.log("Bucket:", bucket);
  console.log("Generating signed upload URL for:", objectKey);

  const res = await supabasePostsAdmin.storage
    .from(bucket)
    .createSignedUploadUrl(objectKey);

  if (res.error) {
    console.error("Failed to generate signed upload URL:", res.error);
    return;
  }

  console.log("Successfully generated signed upload URL!", res.data);
}

main().catch(err => {
  console.error("Unhandled error in sign test:", err);
});
