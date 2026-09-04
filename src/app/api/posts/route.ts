import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";
import { prismaAttachments } from "@/lib/prismaAttachments";
import { supabasePosts, supabasePostsAdmin } from "@/lib/supabasePosts";
import { createPostSchema, validateRequest } from "@/lib/validation";
import { touchUserPresence } from "@/lib/presence";

export const runtime = "nodejs";

type Audience = "GLOBAL" | "FOLLOWERS" | "FRIENDS" | "ALL";

function isAudience(value: unknown): value is Audience {
  return (
    value === "GLOBAL" ||
    value === "FOLLOWERS" ||
    value === "FRIENDS" ||
    value === "ALL"
  );
}

async function getSignedMediaUrl(params: { bucket: string; objectKey: string; id?: string }) {
  if (!params?.bucket || !params?.objectKey) return null;

  // Native Database Vault items stream directly via resilient internal proxy
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
  } catch {
    // fallback to proxy
  }

  try {
    const res = await client.storage
      .from(params.bucket)
      .createSignedUrl(params.objectKey, 60 * 60 * 24);

    if (res.data?.signedUrl) return res.data.signedUrl;
  } catch (err) {
    console.warn("[posts] Error in getSignedMediaUrl, falling back to stream proxy:", err);
  }
  return params.id ? `/api/media/stream?id=${params.id}` : null;
}

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    const meId = (session?.user as any)?.id as string | undefined;

    const url = new URL(request.url);
    const mode = url.searchParams.get("mode");

    const now = new Date();

    if (mode === "directory_global_latest") {
      const perAuthorRaw = url.searchParams.get("perAuthor");
      const perAuthor = perAuthorRaw ? Math.max(1, Math.min(20, Number(perAuthorRaw))) : 10;

      const posts = await (prisma as any).post.findMany({
        where: {
          audience: { in: ["GLOBAL", "ALL"] },
        },
        orderBy: { createdAt: "desc" },
        take: 600,
        include: {
          author: {
            select: {
              id: true,
              handle: true,
              name: true,
              image: true,
              aura_percentage: true,
              blue_tick_status: true,
              points: true,
            },
          },
          _count: {
            select: {
              reactions: true,
              comments: true,
              views: true,
            },
          },
        },
      });

      const pickedByAuthor = new Map<string, any[]>();
      for (const p of posts as any[]) {
        const arr = pickedByAuthor.get(p.authorId) || [];
        if (arr.length >= perAuthor) continue;
        arr.push(p);
        pickedByAuthor.set(p.authorId, arr);
      }

      const picked = Array.from(pickedByAuthor.values()).flat();

      const attachmentIds: string[] = picked
        .map((p: any) => p.attachmentId)
        .filter((id: any): id is string => typeof id === "string" && id.length > 0);

      const attachments: any[] = attachmentIds.length
        ? await (prismaAttachments as any).attachment.findMany({
            where: { id: { in: attachmentIds } },
            select: {
              id: true,
              kind: true,
              bucket: true,
              objectKey: true,
              mimeType: true,
              sizeBytes: true,
            },
          })
        : [];

      const attachmentById = new Map<string, any>(
        attachments.map((a) => [a.id as string, a]),
      );

      const postsWithMedia = await Promise.all(
        picked.map(async (p: any) => {
          if (!p.attachmentId) return p;

          const att = attachmentById.get(p.attachmentId as string);
          if (!att || !att.bucket || !att.objectKey) {
            return { ...p, media: null };
          }

          const normalizedKind =
            typeof att.kind === "string" ? att.kind.toLowerCase() : (p.attachmentKind?.toLowerCase() || att.kind);

          const signedUrl = await getSignedMediaUrl({
            bucket: att.bucket as string,
            objectKey: att.objectKey as string,
          });

          if (!signedUrl && normalizedKind !== "video") {
            console.warn("[posts] Failed to create signed/public URL for attachment", {
              postId: p.id,
              attachmentId: p.attachmentId,
              bucket: att.bucket,
            });
          }

          return {
            ...p,
            media: signedUrl
              ? {
                  kind: normalizedKind,
                  url: signedUrl,
                  mimeType: att.mimeType,
                  sizeBytes:
                    typeof att.sizeBytes === "bigint"
                      ? Number(att.sizeBytes)
                      : att.sizeBytes,
                }
              : null,
          };
        }),
      );

      return NextResponse.json(
        { posts: postsWithMedia, perAuthor },
        { headers: { "Cache-Control": "no-store" } },
      );
    }

    const posts = await (prisma as any).post.findMany({
      where: {
        OR: [
          { audience: { in: ["GLOBAL", "ALL"] } },
          { expiresAt: { gt: now } }
        ]
      },
      orderBy: { createdAt: "desc" },
      take: 100,
      include: {
        author: {
          select: {
            id: true,
            handle: true,
            name: true,
            image: true,
          },
        },
        _count: {
          select: {
            reactions: true,
            comments: true,
            views: true,
          },
        },
      },
    });

    // Filter by visibility rules.
    // GLOBAL/ALL: visible to everyone
    // FOLLOWERS: visible if viewer follows author or viewer is author
    // FRIENDS: visible if accepted friend connection exists or viewer is author

    const authorIds: string[] = Array.from(
      new Set((posts as Array<{ authorId: string }>).map((p) => p.authorId)),
    );

    let followingSet = new Set<string>();
    if (meId) {
      try {
        const follows: Array<{ followingId: string }> = await (prisma as any).follow.findMany({
          where: {
            followerId: meId,
            followingId: { in: authorIds },
          },
          select: { followingId: true },
        });
        followingSet = new Set(follows.map((f) => f.followingId));
      } catch (err) {
        console.warn("[posts] follow table lookup failed; defaulting to no-follow visibility", err);
      }
    }

    let friendSet = new Set<string>();
    if (meId) {
      try {
        const accepted: Array<{ fromUserId: string; toUserId: string }> = await (prisma as any).friendRequest.findMany({
          where: {
            status: "ACCEPTED",
            OR: [
              { fromUserId: meId, toUserId: { in: authorIds } },
              { toUserId: meId, fromUserId: { in: authorIds } },
            ],
          },
          select: { fromUserId: true, toUserId: true },
        });

        for (const fr of accepted) {
          friendSet.add(fr.fromUserId === meId ? fr.toUserId : fr.fromUserId);
        }
      } catch (err) {
        console.warn("[posts] friendRequest table lookup failed; defaulting to no-friends visibility", err);
      }
    }

    const visible = (posts as Array<{ authorId: string; audience: string }>).filter((p) => {
      if (meId && p.authorId === meId) return true;
      if (p.audience === "GLOBAL" || p.audience === "ALL") return true;
      if (meId && p.audience === "FOLLOWERS") return followingSet.has(p.authorId);
      if (meId && p.audience === "FRIENDS") return friendSet.has(p.authorId);
      return false;
    });

    const attachmentIds: string[] = (visible as any[])
      .map((p: any) => p.attachmentId)
      .filter((id: any): id is string => typeof id === "string" && id.length > 0);

    const attachments: any[] = attachmentIds.length
      ? await (prismaAttachments as any).attachment.findMany({
          where: { id: { in: attachmentIds } },
          select: {
            id: true,
            kind: true,
            bucket: true,
            objectKey: true,
            mimeType: true,
            sizeBytes: true,
          },
        })
      : [];

    const attachmentById = new Map<string, any>(
      attachments.map((a) => [a.id as string, a]),
    );

    const postsWithMedia = await Promise.all(
      (visible as any[]).map(async (p: any) => {
        if (!p.attachmentId) return p;
        const att = attachmentById.get(p.attachmentId as string);
        if (!att || !att.bucket || !att.objectKey) {
          return { ...p, media: null };
        }

        const normalizedKind =
          typeof att.kind === "string" ? att.kind.toLowerCase() : att.kind;

        const signedUrl = await getSignedMediaUrl({
          bucket: att.bucket as string,
          objectKey: att.objectKey as string,
          id: att.id as string,
        });

        return {
          ...p,
          media: signedUrl
            ? {
                kind: normalizedKind,
                url: signedUrl,
                mimeType: att.mimeType,
                sizeBytes:
                  typeof att.sizeBytes === "bigint"
                    ? Number(att.sizeBytes)
                    : att.sizeBytes,
              }
            : null,
        };
      }),
    );

    return NextResponse.json(
      { posts: postsWithMedia },
      { headers: { "Cache-Control": "no-store" } },
    );
  } catch (err: any) {
    console.error("[posts] GET Unhandled error", err);
    // Handle database connection and table errors gracefully
    if (err?.code === 'P1001' || err?.message?.includes('Can\'t reach database server') || 
        err?.code === 'P2021' || err?.message?.includes('does not exist')) {
      return NextResponse.json({ posts: [] }, { headers: { "Cache-Control": "no-store" } });
    }
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user || !(session.user as any).id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const meId = (session.user as any).id as string;
    touchUserPresence(meId);

    const body = await request.json();
    
    // Validate request body using Zod schema
    const { text, audience, attachmentId, attachmentKind } = validateRequest(createPostSchema, body);

    const expiresAt = new Date(Date.now() + 100 * 365 * 24 * 60 * 60 * 1000);

    const post = await (prisma as any).post.create({
      data: {
        author: { connect: { id: meId } },
        text: text || "",
        audience: audience || "GLOBAL",
        attachmentId: attachmentId || null,
        attachmentKind: attachmentKind || null,
        expiresAt,
      },
      include: {
        author: {
          select: {
            id: true,
            handle: true,
            name: true,
            image: true,
          },
        },
        _count: {
          select: {
            reactions: true,
            comments: true,
            views: true,
          },
        },
      },
    });

    if (attachmentId) {
      // Link attachment metadata to this post in attachments DB and mark status uploaded.
      try {
        await (prismaAttachments as any).attachment.update({
          where: { id: attachmentId },
          data: { postId: post.id, status: "uploaded" },
        });
      } catch (err) {
        console.error("[posts] Failed to link attachment to post", err);
      }
    }

    return NextResponse.json({ post });
  } catch (err: any) {
    // Handle validation errors
    if (err.message && err.message.includes('Validation failed')) {
      const errorData = JSON.parse(err.message);
      return NextResponse.json(errorData, { status: 400 });
    }
    
    console.error("[posts] POST Unhandled error", err);
    // Handle database connection and table errors gracefully
    if (err?.code === 'P1001' || err?.message?.includes('Can\'t reach database server') || 
        err?.code === 'P2021' || err?.message?.includes('does not exist')) {
      return NextResponse.json({ error: "Database unavailable. Please try again." }, { status: 503 });
    }
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
