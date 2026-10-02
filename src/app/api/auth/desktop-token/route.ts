import { getToken } from "next-auth/jwt";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  try {
    const token = await getToken({
      req,
      secret: process.env.NEXTAUTH_SECRET,
      raw: true, // Returns the raw encrypted string instead of decrypted object
    });

    if (!token) {
      return NextResponse.json({ error: "No active session found" }, { status: 401 });
    }

    return NextResponse.json({ token });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to retrieve session token" }, { status: 500 });
  }
}
