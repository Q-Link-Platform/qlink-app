import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// Points calculation constants
const POINTS_PER_LIKE = 1;
const POINTS_PER_COMMENT = 2;
const POINTS_PER_FOLLOW = 3;
const POINTS_PER_REFERRAL = 10;

export async function POST(request: NextRequest) {
  try {
    const { userId } = await request.json();
    
    if (!userId) {
      return NextResponse.json({ error: 'User ID required' }, { status: 400 });
    }

    // Calculate points from existing engagement
    const [likesCount, commentsCount, followsCount, referralsCount] = await Promise.all([
      prisma.reaction.count({
        where: { userId }
      }),
      prisma.comment.count({
        where: { authorId: userId }
      }),
      prisma.follow.count({
        where: { followerId: userId }
      }),
      0 // No referral model in schema
    ]);

    // Calculate total points
    const totalPoints = 
      (likesCount * POINTS_PER_LIKE) +
      (commentsCount * POINTS_PER_COMMENT) +
      (followsCount * POINTS_PER_FOLLOW) +
      (referralsCount * POINTS_PER_REFERRAL);

    // Update user's points
    await prisma.user.update({
      where: { id: userId },
      data: { points: totalPoints }
    });

    // Calculate aura percentage
    const auraPercentage = calculateAuraPercentage(totalPoints);

    // Update user's aura
    await prisma.user.update({
      where: { id: userId },
      data: { aura_percentage: auraPercentage }
    });

    return NextResponse.json({
      success: true,
      points: totalPoints,
      auraPercentage,
      breakdown: {
        likes: likesCount,
        comments: commentsCount,
        follows: followsCount,
        referrals: referralsCount
      }
    });

  } catch (error) {
    console.error('Error calculating points:', error);
    return NextResponse.json(
      { error: 'Failed to calculate points' },
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
        points: true,
        aura_percentage: true
      }
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    return NextResponse.json({
      points: user.points,
      auraPercentage: user.aura_percentage
    });

  } catch (error) {
    console.error('Error fetching points:', error);
    return NextResponse.json(
      { error: 'Failed to fetch points' },
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
