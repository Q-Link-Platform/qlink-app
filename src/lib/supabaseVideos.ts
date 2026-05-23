import { createClient } from "@supabase/supabase-js";

// Supabase client for videos (<= 45MB)
// Env vars required:
//   SUPABASE_VIDEOS_URL
//   SUPABASE_VIDEOS_KEY

const videosUrl = process.env.SUPABASE_VIDEOS_URL;
const videosKey = process.env.SUPABASE_VIDEOS_KEY;

if (!videosUrl || !videosKey) {
  console.warn("[supabaseVideos] SUPABASE_VIDEOS_URL or SUPABASE_VIDEOS_KEY is not set");
}

export const supabaseVideos = videosUrl && videosKey
  ? createClient(videosUrl, videosKey)
  : null;
