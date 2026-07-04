import { supabasePostsAdmin } from '../src/lib/supabasePosts';
import sharp from 'sharp';
import fs from 'fs';
import path from 'path';

async function main() {
  const bucket = "Autark-3";
  const objectKey = "images/e2d33884-8194-443e-92e2-6ceb0a30430a.png";
  
  console.log(`Downloading ${bucket}/${objectKey} from Supabase...`);
  if (!supabasePostsAdmin) {
    console.error("supabasePostsAdmin is null!");
    return;
  }

  const { data, error } = await supabasePostsAdmin.storage
    .from(bucket)
    .download(objectKey);

  if (error || !data) {
    console.error("Failed to download image:", error);
    return;
  }

  console.log("Download succeeded! Converting to buffer...");
  const buffer = Buffer.from(await data.arrayBuffer());

  console.log("Reading image metadata with sharp...");
  const metadata = await sharp(buffer).metadata();
  console.log("Image metadata:", {
    format: metadata.format,
    width: metadata.width,
    height: metadata.height,
    size: buffer.length
  });

  // Save the downloaded image in scratch to inspect if needed
  const outputPath = path.join(__dirname, "downloaded_test_image.png");
  fs.writeFileSync(outputPath, buffer);
  console.log("Saved downloaded image to:", outputPath);
}

main().catch(err => {
  console.error("Error inspecting image dimensions:", err);
});
