import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(request: NextRequest) {
  try {
    const { userId } = await request.json();

    if (!userId) {
      return NextResponse.json({ error: 'User ID required' }, { status: 400 });
    }

    // Find the user to verify existence and check current points
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { points: true, blue_tick_status: true, aura_percentage: true }
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Set cost to 50 points and enforce it strictly!
    const cost = 50;
    const currentPoints = user.points || 0;

    if (currentPoints < cost) {
      return NextResponse.json({
        error: 'Insufficient points',
        message: `You need at least ${cost} Quantum Points to unlock the Sapphire VIP Upgrade. Earn points by posting, getting likes, commenting, or connecting with friends!`,
        required: cost,
        current: currentPoints
      }, { status: 400 });
    }

    const newPoints = currentPoints - cost;

    // Update user's VIP status to "SAPPHIRE"
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        blue_tick_status: 'SAPPHIRE',
        points: newPoints,
        // Give a premium base Aura boost if they buy the Sapphire upgrade!
        aura_percentage: (user.aura_percentage || 0) + 150
      }
    });

    return NextResponse.json({
      success: true,
      message: 'Successfully upgraded to Sapphire VIP Status!',
      blue_tick_status: 'SAPPHIRE',
      pointsDeducted: cost,
      remainingPoints: newPoints,
      newAuraPercentage: updatedUser.aura_percentage
    });

  } catch (error) {
    console.error('Error upgrading to Sapphire VIP status:', error);
    return NextResponse.json(
      { error: 'Failed to process Sapphire VIP upgrade' },
      { status: 500 }
    );
  }
}
