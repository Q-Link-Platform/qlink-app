async function testCors() {
  const url = "https://ansfsehkrddmrwnjspek.supabase.co/storage/v1/object/public/Autark-3/videos/caeaae7f-1b41-4400-95c1-34f1430c21a3.mp4";

  console.log("=== TESTING CORS FOR VERCEL ORIGIN ===");
  try {
    const res = await fetch(url, {
      method: "OPTIONS",
      headers: {
        "Origin": "https://q-link-v3-0.vercel.app",
        "Access-Control-Request-Method": "GET",
      },
    });
    console.log("OPTIONS status:", res.status, res.statusText);
    console.log("Access-Control-Allow-Origin:", res.headers.get("access-control-allow-origin"));
  } catch (err: any) {
    console.error("OPTIONS error:", err.message);
  }

  try {
    const res2 = await fetch(url, {
      headers: {
        "Origin": "https://q-link-v3-0.vercel.app",
      },
    });
    console.log("GET status:", res2.status, res2.statusText);
    console.log("Access-Control-Allow-Origin:", res2.headers.get("access-control-allow-origin"));
  } catch (err: any) {
    console.error("GET error:", err.message);
  }
}

testCors().catch(console.error);
