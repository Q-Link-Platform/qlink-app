import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import twilio from "twilio";

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => ({}));
    const phone = body.phone?.trim();

    if (!phone) {
      return NextResponse.json(
        { error: "Phone number is required" },
        { status: 400 }
      );
    }

    // Standard phone number sanity check (at least 7 digits)
    if (phone.length < 7) {
      return NextResponse.json(
        { error: "Please enter a valid phone number" },
        { status: 400 }
      );
    }

    // Removed the "Already Active" blocking logic because generating an OTP does not overwrite the sessionToken.
    // The session is only overwritten after successful OTP verification, making the physical SMS the ultimate security barrier.
    // This allows legitimate users to clear cookies and instantly re-request an OTP without waiting for a 3-minute presence timeout.

    // 1. Generate 6-digit code
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes validity

    // 2. Save or update OTP record in PostgreSQL database
    await prisma.otpCode.upsert({
      where: { phone },
      update: {
        code,
        expiresAt,
        createdAt: new Date(),
      },
      create: {
        phone,
        code,
        expiresAt,
      },
    });

    // 3. Dispatch SMS if Twilio keys are configured
    const twilioSid = process.env.TWILIO_ACCOUNT_SID;
    const twilioToken = process.env.TWILIO_AUTH_TOKEN;
    const twilioFrom = process.env.TWILIO_PHONE_NUMBER;

    let sentViaSms = false;

    if (twilioSid && twilioToken && twilioFrom) {
      try {
        const client = twilio(twilioSid, twilioToken);
        await client.messages.create({
          body: `Your Q-Link secure access key is: ${code}. Valid for 5 minutes.`,
          from: twilioFrom,
          to: phone,
        });
        sentViaSms = true;
        console.log(`[OTP SYSTEM] Real SMS OTP dispatched to ${phone}`);
      } catch (err: any) {
        console.error("[OTP SYSTEM] Twilio API Dispatch Error:", err.message || err);
      }
    }

    if (!sentViaSms) {
      // Elegant Console Log simulation for development
      console.log("\n========================================");
      console.log(`🔑 Q-LINK SECURE OTP DISPATCH (SIMULATED)`);
      console.log(`📱 TARGET PHONE: ${phone}`);
      console.log(`🔑 CODE: ${code}`);
      console.log("========================================\n");
    }

    return NextResponse.json({
      success: true,
      message: "Verification code sent.",
      mocked: !sentViaSms,
    });
  } catch (error: any) {
    console.error("[OTP API Error]:", error);
    return NextResponse.json(
      { error: "Internal server error. Unable to send verification key." },
      { status: 500 }
    );
  }
}
