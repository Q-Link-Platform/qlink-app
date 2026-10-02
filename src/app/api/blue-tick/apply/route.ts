import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(request: NextRequest) {
  try {
    const { userId, documentUrl } = await request.json();
    
    if (!userId) {
      return NextResponse.json({ error: 'User ID required' }, { status: 400 });
    }

    // Check if user has enough points
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { points: true, blue_tick_status: true }
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    if ((user.points || 0) < 100) {
      return NextResponse.json({ 
        error: 'Insufficient points', 
        message: 'You need at least 100 points to apply for Blue Tick verification',
        required: 100,
        current: user.points || 0
      }, { status: 400 });
    }

    if (user.blue_tick_status !== 'none') {
      return NextResponse.json({ 
        error: 'Application already exists', 
        message: `You already have a ${user.blue_tick_status} application`,
        status: user.blue_tick_status
      }, { status: 400 });
    }

    // Deduct 100 points for application
    await prisma.user.update({
      where: { id: userId },
      data: {
        points: (user.points || 0) - 100,
        blue_tick_status: 'pending'
      }
    });

    // Recalculate aura after points deduction
    const newAuraPercentage = calculateAuraPercentage((user.points || 0) - 100);
    await prisma.user.update({
      where: { id: userId },
      data: { aura_percentage: newAuraPercentage }
    });

    return NextResponse.json({
      success: true,
      message: 'Blue Tick application submitted successfully!',
      pointsDeducted: 100,
      remainingPoints: (user.points || 0) - 100,
      newAuraPercentage,
      applicationStatus: 'pending'
    });

  } catch (error) {
    console.error('Error submitting blue tick application:', error);
    return NextResponse.json(
      { error: 'Failed to submit application' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json({ error: 'User ID required' }, { status: 400 });
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        blue_tick_status: true,
        points: true
      }
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    return NextResponse.json({
      status: user.blue_tick_status,
      appliedAt: null,
      documentUrl: null,
      points: user.points || 0,
      canApply: user.blue_tick_status === 'none' && (user.points || 0) >= 100
    });

  } catch (error) {
    console.error('Error fetching blue tick status:', error);
    return NextResponse.json(
      { error: 'Failed to fetch application status' },
      { status: 500 }
    );
  }
}

function calculateAuraPercentage(points: number): number {
  if (points < 5) return 0;
  if (points < 100) return 50;
  if (points < 1000) return 100;
  if (points < 10000) return 1000;
  if (points < 105000) return 10500;
  return 999999;
}
