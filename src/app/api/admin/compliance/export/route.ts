import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { isAdmin as checkIsAdmin } from "@/lib/admin";
import { generateComplianceReport } from "@/lib/compliance";

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    const userId = (session?.user as any)?.id as string | undefined;
    const userEmail = session?.user?.email;

    if (!session || !session.user || (!userId && !userEmail)) {
      return NextResponse.json(
        { error: "Unauthorized: Please sign in." },
        { status: 401 }
      );
    }

    const authorized = await checkIsAdmin(userId || userEmail || "");
    if (!authorized) {
      return NextResponse.json(
        { error: "Forbidden: Platform Administrator clearance required." },
        { status: 403 }
      );
    }


    const { targetIdentifier, warrantReferenceId } = await req.json();

    if (!targetIdentifier || typeof targetIdentifier !== "string") {
      return NextResponse.json(
        { error: "Missing required parameter: targetIdentifier (Handle, Email, or User ID)" },
        { status: 400 }
      );
    }

    const report = await generateComplianceReport(
      targetIdentifier,
      warrantReferenceId || "WARRANT-DIRECT-INSPECTION",
      userEmail || "admin@qlink.com"
    );


    if (!report) {
      return NextResponse.json(
        { error: `Target account '${targetIdentifier}' not found in registry.` },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      report,
    });
  } catch (error) {
    console.error("[Compliance Export Error]:", error);
    return NextResponse.json(
      { error: "Failed to generate compliance data package." },
      { status: 500 }
    );
  }
}
