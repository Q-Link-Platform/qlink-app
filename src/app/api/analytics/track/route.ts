import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(request: NextRequest) {
  try {
    const { userId } = await request.json();
    
    if (!userId) {
      return NextResponse.json({ error: 'User ID required' }, { status: 400 });
    }

    // Get user's current IP address
    const forwarded = request.headers.get('x-forwarded-for');
    const realIp = request.headers.get('x-real-ip');
    const ip = forwarded?.split(',')[0] || realIp || 'unknown';

    // Update user's last seen
    await prisma.user.update({
      where: { id: userId },
      data: {
        lastSeenAt: new Date()
      }
    });

    // Get user's current stats
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        points: true,
        aura_percentage: true,
        blue_tick_status: true,
        image: true,
        createdAt: true,
        lastSeenAt: true
      }
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Calculate engagement stats
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

    // Get recent activity (last 7 days)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const [recentPosts, recentComments, recentLikes] = await Promise.all([
      prisma.post.count({
        where: {
          authorId: userId,
          createdAt: { gte: sevenDaysAgo }
        }
      }),
      prisma.comment.count({
        where: {
          authorId: userId,
          createdAt: { gte: sevenDaysAgo }
        }
      }),
      prisma.reaction.count({
        where: {
          userId,
          createdAt: { gte: sevenDaysAgo }
        }
      })
    ]);

    return NextResponse.json({
      success: true,
      user: {
        points: user.points,
        auraPercentage: user.aura_percentage,
        blueTickStatus: user.blue_tick_status,
        profilePhotoUrl: user.image,
        memberSince: user.createdAt,
        lastSeen: user.lastSeenAt,
        ipAddress: ip
      },
      stats: {
        totalLikes: likesCount,
        totalComments: commentsCount,
        totalFollows: followsCount,
        totalReferrals: referralsCount,
        recentPosts,
        recentComments,
        recentLikes
      },
      analytics: {
        ipAddress: ip,
        lastSeen: new Date(),
        recentActivity: {
          posts: recentPosts,
          comments: recentComments,
          likes: recentLikes
        }
      }
    });

  } catch (error) {
    console.error('Error tracking user analytics:', error);
    return NextResponse.json(
      { error: 'Failed to track analytics' },
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
        aura_percentage: true,
        blue_tick_status: true,
        image: true,
        lastSeenAt: true,
        createdAt: true
      }
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      user: {
        points: user.points,
        auraPercentage: user.aura_percentage,
        blueTickStatus: user.blue_tick_status,
        profilePhotoUrl: user.image,
        ipAddress: "unknown",
        lastSeen: user.lastSeenAt,
        memberSince: user.createdAt
      }
    });

  } catch (error) {
    console.error('Error fetching user analytics:', error);
    return NextResponse.json(
      { error: 'Failed to fetch analytics' },
      { status: 500 }
    );
  }
}
