import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(request: NextRequest) {
  try {
    const { userId } = await request.json();

    if (!userId) {
      return NextResponse.json({ error: 'User ID required' }, { status: 400 });
    }

    // Find the user to verify existence and check current state
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { blue_tick_status: true, aura_percentage: true }
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    if (user.blue_tick_status !== 'SAPPHIRE') {
      return NextResponse.json({
        error: 'Not upgraded',
        message: 'Only Sapphire VIP upgraded accounts can be downgraded.'
      }, { status: 400 });
    }

    const currentAura = user.aura_percentage || 0;
    const newAura = Math.max(0, currentAura - 150);

    // Revert blue_tick_status to NONE and strip the aura percentage boost
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        blue_tick_status: 'NONE',
        aura_percentage: newAura
      }
    });

    return NextResponse.json({
      success: true,
      message: 'Successfully downgraded to standard status.',
      blue_tick_status: 'NONE',
      newAuraPercentage: updatedUser.aura_percentage
    });

  } catch (error) {
    console.error('Error downgrading from Sapphire status:', error);
    return NextResponse.json(
      { error: 'Failed to process account downgrade' },
      { status: 500 }
    );
  }
}
