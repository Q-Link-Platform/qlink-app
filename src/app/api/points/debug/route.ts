import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { isAdmin } from "@/lib/admin";
import { prisma } from '@/lib/prisma';

export async function POST(request: NextRequest) {
  try {
    // 1. Enforce authenticated session
    const session = await getServerSession(authOptions);
    if (!session?.user || !(session.user as any).id) {
      return NextResponse.json({ error: 'Unauthorized access' }, { status: 401 });
    }

    const callerId = (session.user as any).id as string;

    // 2. Strict administrator barrier
    const authorized = await isAdmin(callerId);
    if (!authorized) {
      return NextResponse.json({ error: 'Forbidden: Administrator clearance required.' }, { status: 403 });
    }

    // 3. Environment check
    if (process.env.NODE_ENV === "production" && process.env.ALLOW_DEBUG_POINTS !== "true") {
      return NextResponse.json({ error: 'Debug points modification disabled in production.' }, { status: 403 });
    }

    const { userId, amount } = await request.json().catch(() => ({}));
    if (!userId) {
      return NextResponse.json({ error: 'User ID required' }, { status: 400 });
    }

    const parsedAmount = parseInt(amount, 10);
    if (isNaN(parsedAmount) || parsedAmount <= 0 || parsedAmount > 100000) {
      return NextResponse.json({ error: 'Invalid amount. Maximum single adjustment is 100,000 QP.' }, { status: 400 });
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { points: true }
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        points: (user.points || 0) + parsedAmount
      }
    });

    return NextResponse.json({
      success: true,
      points: updatedUser.points,
      message: `Successfully credited ${parsedAmount} Quantum Points.`
    });
  } catch (error) {
    console.error('Error adding debug points:', error);
    return NextResponse.json({ error: 'Failed to credit points' }, { status: 500 });
  }
}

