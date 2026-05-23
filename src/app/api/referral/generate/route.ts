import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { userId } = await request.json();
    if (!userId) {
      return NextResponse.json({ error: 'User ID required' }, { status: 400 });
    }
    const referralCode = "QREF" + Math.random().toString(36).substring(2, 6).toUpperCase();
    return NextResponse.json({
      success: true,
      referralCode,
      referralLink: `https://qlink.com/ref/${referralCode}`
    });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to generate referral code' }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  try {
    const referralCode = "QREF1234";
    return NextResponse.json({
      referralCode,
      referralLink: `https://qlink.com/ref/${referralCode}`,
      stats: {
        totalReferred: 0,
        pointsAwarded: 0,
        status: 'pending'
      }
    });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch referral info' }, { status: 500 });
  }
}
