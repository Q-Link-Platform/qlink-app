import { GET } from "../src/app/api/media/stream/route";

async function testStreamRoute() {
  const attId = "cms7k4q510000jahsq2n2ih06"; // @ghorhh473-3269's video attachment
  console.log(`\n=== TESTING MEDIA STREAM PROXY FOR ATTACHMENT ${attId} ===`);

  // Test full GET
  const req1 = new Request(`http://localhost:3000/api/media/stream?id=${attId}`);
  const res1 = await GET(req1);
  console.log("Full GET Status:", res1.status, res1.statusText);
  console.log("Content-Type:", res1.headers.get("content-type"));
  console.log("Content-Length:", res1.headers.get("content-length"));
  console.log("Accept-Ranges:", res1.headers.get("accept-ranges"));

  // Test Partial Range GET (bytes=0-1024)
  const req2 = new Request(`http://localhost:3000/api/media/stream?id=${attId}`, {
    headers: { Range: "bytes=0-1024" },
  });
  const res2 = await GET(req2);
  console.log("\nRange GET Status:", res2.status, res2.statusText);
  console.log("Content-Range:", res2.headers.get("content-range"));
  console.log("Content-Length:", res2.headers.get("content-length"));
}

testStreamRoute().catch(console.error);
