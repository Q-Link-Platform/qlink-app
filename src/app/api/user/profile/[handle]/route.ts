import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";
import { cleanHandle } from "@/lib/handle-utils";
import { findSyntheticUser, RAW_SYNTHETIC_PROFILES } from "@/lib/globalMockDirectory";
import { findManyAttachmentRecords } from "@/lib/attachmentDb";
import { supabasePosts, supabasePostsAdmin } from "@/lib/supabasePosts";

export const runtime = "nodejs";

async function getSignedMediaUrl(params: { bucket: string; objectKey: string; id?: string }) {
  if (!params?.bucket || !params?.objectKey) return null;

  if (params.bucket === "database" || params.objectKey.startsWith("data:")) {
    return `/api/media/stream?id=${params.id}`;
  }

  const client = supabasePostsAdmin || supabasePosts;
  if (!client) {
    return params.id ? `/api/media/stream?id=${params.id}` : null;
  }

  try {
    const pub = client.storage.from(params.bucket).getPublicUrl(params.objectKey);
    if (pub.data?.publicUrl) return pub.data.publicUrl;
  } catch {}

  try {
    const res = await client.storage
      .from(params.bucket)
      .createSignedUrl(params.objectKey, 60 * 60 * 24);

    if (res.data?.signedUrl) return res.data.signedUrl;
  } catch (err) {
    console.warn("[profile-api] Error resolving signed media URL:", err);
  }
  return params.id ? `/api/media/stream?id=${params.id}` : null;
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ handle: string }> }
) {
  try {
    const rawParam = (await params)?.handle;
    if (!rawParam) {
      return NextResponse.json({ error: "Handle parameter missing" }, { status: 400 });
    }

    const decoded = decodeURIComponent(rawParam).trim();
    const cleaned = cleanHandle(decoded);

    const session = await getServerSession(authOptions);
    const meId = (session?.user as any)?.id as string | undefined;

    const isVipFounder =
      cleaned.toLowerCase() === "rohit_7779" ||
      decoded.toLowerCase() === "rohit_7779" ||
      cleaned.toLowerCase() === "mr_rohit" ||
      decoded.toLowerCase() === "mr_rohit";

    // 1. Check database for actual user
    let dbUser: any = null;
    try {
      dbUser = await prisma.user.findFirst({
        where: {
          OR: [
            { handle: { equals: decoded, mode: "insensitive" } },
            { handle: { equals: cleaned, mode: "insensitive" } },
            { id: decoded },
            { email: { equals: decoded, mode: "insensitive" } },
          ],
        },
        select: {
          id: true,
          handle: true,
          name: true,
          email: true,
          image: true,
          bio: true,
          banner: true,
          location: true,
          website: true,
          blue_tick_status: true,
          aura_percentage: true,
          points: true,
          createdAt: true,
          lastSeenAt: true,
          _count: {
            select: {
              followers: true,
              following: true,
              posts: true,
            },
          },
        },
      });
    } catch (err) {
      console.warn("[profile-api] DB user lookup fallback warning:", err);
    }

    if (dbUser) {
      // Check follow & friend relationships
      let isFollowing = false;
      let isFriend = false;
      let isPendingRequest = false;

      if (meId && meId !== dbUser.id) {
        try {
          const follow = await prisma.follow.findUnique({
            where: {
              followerId_followingId: {
                followerId: meId,
                followingId: dbUser.id,
              },
            },
          });
          isFollowing = Boolean(follow);
        } catch {}

        try {
          const friendReq = await prisma.friendRequest.findFirst({
            where: {
              OR: [
                { fromUserId: meId, toUserId: dbUser.id },
                { fromUserId: dbUser.id, toUserId: meId },
              ],
            },
            orderBy: { createdAt: "desc" },
          });
          if (friendReq) {
            if (friendReq.status === "ACCEPTED") isFriend = true;
            else if (friendReq.status === "PENDING") isPendingRequest = true;
          }
        } catch {}
      }

      // Fetch user's posts
      let postsWithMedia: any[] = [];
      try {
        const posts = await (prisma as any).post.findMany({
          where: { authorId: dbUser.id },
          orderBy: { createdAt: "desc" },
          take: 30,
          include: {
            _count: {
              select: {
                reactions: true,
                comments: true,
                views: true,
              },
            },
          },
        });

        const attachmentIds: string[] = (posts || [])
          .map((p: any) => p.attachmentId)
          .filter((id: any): id is string => typeof id === "string" && id.length > 0);

        const attachments = attachmentIds.length
          ? await findManyAttachmentRecords(attachmentIds, {
              id: true,
              kind: true,
              bucket: true,
              objectKey: true,
              mimeType: true,
              sizeBytes: true,
            })
          : [];

        const attachmentMap = new Map<string, any>(attachments.map((a: any) => [a.id, a]));

        postsWithMedia = await Promise.all(
          posts.map(async (p: any) => {
            let media = null;
            if (p.attachmentId && attachmentMap.has(p.attachmentId)) {
              const att = attachmentMap.get(p.attachmentId);
              const signed = await getSignedMediaUrl({
                bucket: att.bucket,
                objectKey: att.objectKey,
                id: att.id,
              });
              if (signed) {
                media = {
                  kind: att.kind || p.attachmentKind || "image",
                  url: signed,
                  mimeType: att.mimeType,
                  sizeBytes: att.sizeBytes,
                };
              }
            }
            return {
              id: p.id,
              text: p.text,
              audience: p.audience,
              createdAt: p.createdAt,
              attachmentId: p.attachmentId,
              attachmentKind: p.attachmentKind,
              media,
              _count: p._count || { reactions: 0, comments: 0, views: 0 },
            };
          })
        );
      } catch (err) {
        console.warn("[profile-api] Post fetching warning:", err);
      }

      const isFounder = isVipFounder || dbUser.blue_tick_status === "FOUNDER";

      return NextResponse.json({
        success: true,
        user: {
          id: dbUser.id,
          handle: dbUser.handle || cleaned,
          name: dbUser.name || (isFounder ? "Rohit Purohit" : "Quantum User"),
          image: dbUser.image,
          bio: dbUser.bio || (isFounder
            ? "Founder & CEO at Q‑Link ⚡"
            : "Active on Q-Link."),
          banner: dbUser.banner || null,
          location: dbUser.location || null,
          website: dbUser.website || null,
          createdAt: dbUser.createdAt,
          blue_tick_status: isFounder ? "FOUNDER" : dbUser.blue_tick_status || "NONE",
          isRedTick: isFounder,
          aura_percentage: isFounder ? 999999 : (dbUser.aura_percentage ?? 88),
          points: isFounder ? 999999 : (dbUser.points ?? 350),
          followersCount: isFounder ? Math.max(18420, (dbUser._count?.followers || 0)) : (dbUser._count?.followers || 0),
          followingCount: isFounder ? 77 : (dbUser._count?.following || 0),
          postsCount: isFounder ? Math.max(postsWithMedia.length, 42) : (dbUser._count?.posts || postsWithMedia.length),
          isFollowing,
          isFriend,
          isPendingRequest,
          isSelf: meId === dbUser.id,
          posts: postsWithMedia,
        },
      });
    }

    // 2. Fallback to Founder VIP synthetic profile if handle matches Rohit
    if (isVipFounder) {
      return NextResponse.json({
        success: true,
        user: {
          id: "rohit_founder_vip_id",
          handle: "Rohit_7779",
          name: "Rohit Purohit",
          image: null,
          bio: "Founder & CEO at Q‑Link • Architect of Quantum Encrypted Hyper-Scale Networks & Sovereign Zero-Trust Protocols ⚡",
          createdAt: "2026-01-01T00:00:00.000Z",
          blue_tick_status: "FOUNDER",
          isRedTick: true,
          aura_percentage: 999999,
          points: 999999,
          followersCount: 18450,
          followingCount: 77,
          postsCount: 24,
          isFollowing: false,
          isFriend: false,
          isPendingRequest: false,
          isSelf: false,
          posts: [
            {
              id: "rohit_post_001",
              text: "Welcome to Q‑Link v3.0. Quantum privacy is no longer a luxury; it is a fundamental human right. Direct peer-to-peer optical communication is now live across all nodes. ⚡💎",
              audience: "GLOBAL",
              createdAt: "2026-09-18T10:00:00.000Z",
              attachmentId: null,
              attachmentKind: null,
              media: null,
              _count: { reactions: 1240, comments: 184, views: 24500 },
            },
            {
              id: "rohit_post_002",
              text: "Benchmarking zero-latency Kyber-1024 handshakes with our high-speed WebRTC transport. Speed + uncrackable cryptography is the future.",
              audience: "GLOBAL",
              createdAt: "2026-09-15T14:30:00.000Z",
              attachmentId: null,
              attachmentKind: null,
              media: null,
              _count: { reactions: 840, comments: 92, views: 18200 },
            },
          ],
        },
      });
    }

    // 3. Fallback to Synthetic Ecosystem Directory
    const synth = findSyntheticUser(cleaned) || findSyntheticUser(decoded);
    const fullSynth = RAW_SYNTHETIC_PROFILES.find(
      (p) => p.handle.toLowerCase() === cleaned.toLowerCase() || p.id === decoded
    );

    if (synth || fullSynth) {
      const activeSynth = fullSynth || (synth as any);
      const posts = (activeSynth?.posts || []).map((p: any) => ({
        id: p.id,
        text: p.text,
        audience: p.audience || "GLOBAL",
        createdAt: p.createdAt || "2026-09-10T12:00:00.000Z",
        attachmentId: p.attachmentId || null,
        attachmentKind: p.attachmentKind || null,
        media: p.attachmentId ? { kind: p.attachmentKind || "image", url: `/api/media/stream?id=${p.attachmentId}` } : null,
        _count: p._count || { reactions: 45, comments: 8, views: 620 },
      }));

      const aura = activeSynth.auraPercentage ?? 75;
      const followers = Math.round(aura * 22 + (activeSynth.points || 200) * 2.8);
      const following = Math.round(35 + (followers % 45));

      return NextResponse.json({
        success: true,
        user: {
          id: activeSynth.id,
          handle: activeSynth.handle,
          name: activeSynth.name || "Quantum Pioneer",
          image: activeSynth.image || null,
          bio: `Quantum Mesh Pioneer • Building decentralized and resilient nodes across the Q‑Link global network.`,
          createdAt: synth?.createdAt || "2026-08-01T00:00:00.000Z",
          blue_tick_status: activeSynth.blueTickStatus || "none",
          isRedTick: Boolean(activeSynth.isRedTick),
          aura_percentage: aura,
          points: activeSynth.points ?? 420,
          followersCount: followers,
          followingCount: following,
          postsCount: posts.length,
          isFollowing: false,
          isFriend: false,
          isPendingRequest: false,
          isSelf: false,
          posts,
        },
      });
    }

    return NextResponse.json({ error: `User "@${decoded}" not found` }, { status: 404 });
  } catch (err) {
    console.error("[profile-api GET]", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
