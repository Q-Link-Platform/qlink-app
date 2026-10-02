import { createClient } from "@supabase/supabase-js";

// Supabase client for files & images (<= 10MB)
// Env vars required:
//   SUPABASE_FILES_URL
//   SUPABASE_FILES_KEY

const filesUrl = process.env.SUPABASE_FILES_URL;
const filesKey = process.env.SUPABASE_FILES_KEY;

if (!filesUrl || !filesKey) {
  console.warn("[supabaseFiles] SUPABASE_FILES_URL or SUPABASE_FILES_KEY is not set");
}

export const supabaseFiles = filesUrl && filesKey
  ? createClient(filesUrl, filesKey)
  : null;
