import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { referralCode, referredUserId } = await request.json();
    
    if (!referralCode || !referredUserId) {
      return NextResponse.json({ error: 'Referral code and user ID required' }, { status: 400 });
    }

    return NextResponse.json({
      success: true,
      message: 'Referral claimed successfully (Mocked)!',
      pointsAwarded: 10,
      referrer: {
        id: "mock-referrer-id",
        name: "Mock Referrer",
        handle: "mock_referrer"
      }
    });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to claim referral' }, { status: 500 });
  }
}
