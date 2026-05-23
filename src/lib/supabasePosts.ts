import { createClient } from "@supabase/supabase-js";

// Supabase client for Quantum ID Console posts media.
// Env vars required:
//   SUPABASE_POSTS_URL
//   SUPABASE_POSTS_KEY
// Optional (recommended for private bucket + signed URLs):
//   SUPABASE_POSTS_SERVICE_ROLE_KEY

const postsUrl = process.env.SUPABASE_POSTS_URL;
const postsKey = process.env.SUPABASE_POSTS_KEY;
const postsServiceRoleKey = process.env.SUPABASE_POSTS_SERVICE_ROLE_KEY;

if (!postsUrl || !postsKey) {
  console.warn("[supabasePosts] SUPABASE_POSTS_URL or SUPABASE_POSTS_KEY is not set");
}

export const supabasePosts = postsUrl && postsKey ? createClient(postsUrl, postsKey) : null;

export const supabasePostsAdmin =
  postsUrl && postsServiceRoleKey
    ? createClient(postsUrl, postsServiceRoleKey, {
        auth: {
          persistSession: false,
          autoRefreshToken: false,
        },
      })
    : null;
