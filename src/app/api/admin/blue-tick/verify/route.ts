import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(request: NextRequest) {
  try {
    const { userId, targetUserId, action, reason } = await request.json();
    
    if (!userId || !targetUserId || !action) {
      return NextResponse.json({ error: 'User ID, target user ID, and action required' }, { status: 400 });
    }

    // Only allow admin or privileged users to verify/reject
    // For now, we'll check if the user has admin privileges (you can adjust this logic)
    const adminUser = await prisma.user.findUnique({
      where: { id: userId },
      select: { email: true, handle: true }
    });

    if (!adminUser || !isAdmin(adminUser)) {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 });
    }

    const targetUser = await prisma.user.findUnique({
      where: { id: targetUserId },
      select: { 
        blue_tick_status: true, 
        points: true,
        email: true,
        handle: true
      }
    });

    if (!targetUser) {
      return NextResponse.json({ error: 'Target user not found' }, { status: 404 });
    }

    if (targetUser.blue_tick_status !== 'pending') {
      return NextResponse.json({ 
        error: 'Invalid application status', 
        message: `User application is ${targetUser.blue_tick_status}, not pending`,
        currentStatus: targetUser.blue_tick_status
      }, { status: 400 });
    }

    let newStatus: string;
    let message: string;

    if (action === 'approve') {
      newStatus = 'verified';
      message = 'Blue Tick verification approved!';
    } else if (action === 'reject') {
      newStatus = 'rejected';
      message = 'Blue Tick verification rejected.';
    } else {
      return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }

    // Update user's blue tick status
    await prisma.user.update({
      where: { id: targetUserId },
      data: {
        blue_tick_status: newStatus
      }
    });

    // If rejected, refund the 100 points
    if (action === 'reject') {
      await prisma.user.update({
        where: { id: targetUserId },
        data: {
          points: {
            increment: 100
          }
        }
      });

      // Recalculate aura after refund
      const newAuraPercentage = calculateAuraPercentage((targetUser.points || 0) + 100);
      await prisma.user.update({
        where: { id: targetUserId },
        data: { aura_percentage: newAuraPercentage }
      });
    }

    return NextResponse.json({
      success: true,
      message,
      action,
      targetUser: {
        id: targetUserId,
        email: targetUser.email,
        handle: targetUser.handle,
        newStatus
      },
      pointsRefunded: action === 'reject' ? 100 : 0
    });

  } catch (error) {
    console.error('Error processing blue tick verification:', error);
    return NextResponse.json(
      { error: 'Failed to process verification' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status') as 'pending' | 'verified' | 'rejected' | 'all';

    const whereClause: any = {};
    if (status && status !== 'all') {
      whereClause.blue_tick_status = status;
    }

    const applications = await prisma.user.findMany({
      where: {
        blue_tick_status: { not: 'none' }
      },
      select: {
        id: true,
        email: true,
        handle: true,
        blue_tick_status: true,
        points: true,
        createdAt: true
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    return NextResponse.json({
      success: true,
      applications,
      count: applications.length
    });

  } catch (error) {
    console.error('Error fetching blue tick applications:', error);
    return NextResponse.json(
      { error: 'Failed to fetch applications' },
      { status: 500 }
    );
  }
}

function isAdmin(user: { email?: string | null; handle?: string | null }): boolean {
  // For now, only allow specific admin users
  // You can adjust this based on your admin system
  const adminEmails = [
    'admin@qlink.com',
    'support@qlink.com',
    // Add your admin emails here
  ];
  
  return adminEmails.includes(user?.email || '');
}

function calculateAuraPercentage(points: number): number {
  if (points < 5) return 0;
  if (points < 100) return 50;
  if (points < 1000) return 100;
  if (points < 10000) return 1000;
  if (points < 105000) return 10500;
  return 999999;
}
