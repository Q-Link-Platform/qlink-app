import { prisma } from "../src/lib/prisma";
import { prismaAttachments } from "../src/lib/prismaAttachments";
import { supabasePostsAdmin } from "../src/lib/supabasePosts";

async function testApi() {
  const res = await fetch("http://localhost:3002/api/posts?mode=directory_global_latest&perAuthor=10");
  if (!res.ok) {
    console.log("Fetch failed:", res.status, res.statusText);
    return;
  }
  const data = await res.json();
  console.log(`Fetched ${data.posts?.length} posts:`);
  
  for (const post of data.posts || []) {
    if (post.media) {
      console.log(`\nPost ID: ${post.id}`);
      console.log(`Author: ${post.author?.handle}`);
      console.log(`Media Kind: ${post.media.kind}`);
      console.log(`Media URL: ${post.media.url}`);

      // Test HEAD request on media URL
      try {
        const headRes = await fetch(post.media.url, { method: "HEAD" });
        console.log(`HEAD status: ${headRes.status} ${headRes.statusText}`);
        console.log(`Content-Type: ${headRes.headers.get("content-type")}`);
        console.log(`Access-Control-Allow-Origin: ${headRes.headers.get("access-control-allow-origin")}`);
      } catch (err: any) {
        console.error(`HEAD fetch error: ${err.message}`);
      }
    }
  }
}

testApi().catch(console.error);
