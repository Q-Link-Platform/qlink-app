import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(request: NextRequest) {
  try {
    const { userId, tier = 'DIAMOND' } = await request.json();

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

    const isDiamond = tier === 'DIAMOND';
    const cost = isDiamond ? 100 : 50;
    const targetStatus = isDiamond ? 'DIAMOND' : 'SAPPHIRE';
    const auraBoost = isDiamond ? 300 : 150;
    const currentPoints = user.points || 0;

    if (currentPoints < cost) {
      return NextResponse.json({
        error: 'Insufficient points',
        message: `You need at least ${cost} Quantum Points to unlock the ${isDiamond ? 'Diamond' : 'Sapphire'} VIP Upgrade. Earn points by posting, getting likes, commenting, or connecting with friends!`,
        required: cost,
        current: currentPoints
      }, { status: 400 });
    }

    const newPoints = currentPoints - cost;

    // Update user's VIP status
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        blue_tick_status: targetStatus,
        points: newPoints,
        aura_percentage: (user.aura_percentage || 0) + auraBoost
      }
    });

    return NextResponse.json({
      success: true,
      message: `Successfully upgraded to ${isDiamond ? 'Diamond' : 'Sapphire'} VIP Status!`,
      blue_tick_status: targetStatus,
      pointsDeducted: cost,
      remainingPoints: newPoints,
      newAuraPercentage: updatedUser.aura_percentage
    });

  } catch (error) {
    console.error('Error upgrading VIP status:', error);
    return NextResponse.json(
      { error: 'Failed to process VIP upgrade' },
      { status: 500 }
    );
  }
}

