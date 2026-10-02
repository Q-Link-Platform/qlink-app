async function testVideo() {
  const url = "https://ansfsehkrddmrwnjspek.supabase.co/storage/v1/object/public/Autark-3/videos/caeaae7f-1b41-4400-95c1-34f1430c21a3.mp4";
  
  console.log("=== TESTING VIDEO DIRECT FETCH ===");
  const res1 = await fetch(url, { method: "HEAD" });
  console.log("Plain HEAD:", res1.status, res1.headers.get("content-type"), res1.headers.get("content-length"));

  const res2 = await fetch(url + "#t=0.1", { method: "HEAD" });
  console.log("Fragment HEAD:", res2.status);

  // Range request test (bytes=0-1024)
  const res3 = await fetch(url, { headers: { Range: "bytes=0-1024" } });
  console.log("Range GET 0-1024 status:", res3.status, res3.statusText);
  console.log("Content-Range:", res3.headers.get("content-range"));
}

testVideo().catch(console.error);
