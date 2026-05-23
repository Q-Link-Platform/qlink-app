import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(request: NextRequest) {
  try {
    const { userId, amount } = await request.json();
    if (!userId) {
      return NextResponse.json({ error: 'User ID required' }, { status: 400 });
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { points: true }
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const addAmount = amount || 50;
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        points: (user.points || 0) + addAmount
      }
    });

    return NextResponse.json({
      success: true,
      points: updatedUser.points,
      message: `Successfully credited ${addAmount} test Quantum Points!`
    });
  } catch (error) {
    console.error('Error adding debug points:', error);
    return NextResponse.json({ error: 'Failed to credit points' }, { status: 500 });
  }
}
