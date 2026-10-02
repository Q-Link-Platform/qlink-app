import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { prisma } from '@/lib/prisma';

function calculateAuraPercentage(points: number): number {
  if (points < 5) return 0;
  if (points < 100) return 50;
  if (points < 1000) return 100;
  if (points < 10000) return 1000;
  if (points < 105000) return 10500;
  return 999999;
}

export async function POST(request: NextRequest) {
  try {
    const { referrerHandle } = await request.json();

    if (!referrerHandle) {
      return NextResponse.json({ error: 'Referrer handle required' }, { status: 400 });
    }

    // 1. Authenticate referee user session
    const session = await getServerSession(authOptions);
    if (!session || !(session.user as any)?.id) {
      return NextResponse.json(
        { error: 'Authentication required. Please sign in to verify referral.' },
        { status: 401 }
      );
    }

    const refereeId = (session.user as any).id;

    // 2. Load referee from DB to check claim status
    const referee = await prisma.user.findUnique({
      where: { id: refereeId },
      select: { id: true, handle: true, hasClaimedReferral: true }
    });

    if (!referee) {
      return NextResponse.json({ error: 'Referee user profile not found' }, { status: 404 });
    }

    // 3. Block self-referrals
    if (referee.handle === referrerHandle) {
      return NextResponse.json({ error: 'Self-referral is not allowed.' }, { status: 400 });
    }

    // 4. Block double claims (already claimed)
    if (referee.hasClaimedReferral) {
      return NextResponse.json(
        { error: 'You have already claimed a referral bonus.' },
        { status: 400 }
      );
    }

    // 5. Execute secure transactional points credit
    const POINTS_PER_CLICK = 5;
    
    const result = await prisma.$transaction(async (tx) => {
      // Find the referrer inside the transaction to avoid race conditions
      const referrer = await tx.user.findUnique({
        where: { handle: referrerHandle },
        select: { id: true, points: true }
      });

      if (!referrer) {
        throw new Error('Referrer user not found.');
      }

      const currentPoints = referrer.points || 0;
      const newPoints = currentPoints + POINTS_PER_CLICK;
      const newAura = calculateAuraPercentage(newPoints);

      // A. Credit points and upgrade Aura Level for the referrer
      const updatedReferrer = await tx.user.update({
        where: { id: referrer.id },
        data: {
          points: newPoints,
          aura_percentage: newAura
        }
      });

      // B. Mark the referee as claimed to prevent future awards
      await tx.user.update({
        where: { id: refereeId },
        data: {
          hasClaimedReferral: true,
          referredById: referrer.id
        }
      });

      return {
        newPoints: updatedReferrer.points
      };
    });

    return NextResponse.json({
      success: true,
      message: `Successfully registered referral click! Credited +${POINTS_PER_CLICK} QP to @${referrerHandle}.`,
      pointsAwarded: POINTS_PER_CLICK,
      newPoints: result.newPoints
    });

  } catch (error: any) {
    console.error('Error registering referral click:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to process referral click' },
      { status: 500 }
    );
  }
}

