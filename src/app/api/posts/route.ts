import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";
import { prismaAttachments } from "@/lib/prismaAttachments";
import { supabasePostsAdmin } from "@/lib/supabasePosts";

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

async function getSignedMediaUrl(params: {
  bucket: string;
  objectKey: string;
}): Promise<string | null> {
  if (!supabasePostsAdmin) return null;
  const res = await supabasePostsAdmin.storage
    .from(params.bucket)
    .createSignedUrl(params.objectKey, 60 * 10);

  if (res.error || !res.data?.signedUrl) return null;
  return res.data.signedUrl;
}

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    const meId = (session?.user as any)?.id as string | undefined;

    const url = new URL(request.url);
    const mode = url.searchParams.get("mode");

    // Note: This is a first-pass feed implementation.
    // We will refine visibility + pagination once follow system UI is wired.

    const now = new Date();

    if (mode === "directory_global_latest") {
      const perAuthorRaw = url.searchParams.get("perAuthor");
      const perAuthor = perAuthorRaw ? Math.max(1, Math.min(10, Number(perAuthorRaw))) : 3;

      const posts = await (prisma as any).post.findMany({
        where: {
          expiresAt: { gt: now },
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
            typeof att.kind === "string" ? att.kind.toLowerCase() : att.kind;

          const signedUrl = await getSignedMediaUrl({
            bucket: att.bucket as string,
            objectKey: att.objectKey as string,
          });

          if (!signedUrl) {
            console.warn("[posts] Failed to create signed URL for attachment", {
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
        expiresAt: { gt: now },
      },
      orderBy: { createdAt: "desc" },
      take: 50,
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

    const body: {
      text?: string | null;
      audience?: Audience;
      attachmentId?: string | null;
      attachmentKind?: "image" | "video" | null;
    } = await request.json();

    const audience: Audience = isAudience(body.audience) ? body.audience : "GLOBAL";
    const text = typeof body.text === "string" ? body.text.trim() : "";

    const attachmentId =
      typeof body.attachmentId === "string" && body.attachmentId.length
        ? body.attachmentId
        : null;

    const attachmentKind =
      body.attachmentKind === "image" || body.attachmentKind === "video"
        ? body.attachmentKind
        : null;

    if (!text && !attachmentId) {
      return NextResponse.json(
        { error: "Post must include text or media" },
        { status: 400 },
      );
    }

    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);

    const post = await (prisma as any).post.create({
      data: {
        author: { connect: { id: meId } },
        text: text || "",
        audience,
        attachmentId,
        attachmentKind,
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
      // Link attachment metadata to this post in attachments DB.
      try {
        await (prismaAttachments as any).attachment.update({
          where: { id: attachmentId },
          data: { postId: post.id },
        });
      } catch (err) {
        console.error("[posts] Failed to link attachment to post", err);
      }
    }

    return NextResponse.json({ post });
  } catch (err: any) {
    console.error("[posts] POST Unhandled error", err);
    // Handle database connection and table errors gracefully
    if (err?.code === 'P1001' || err?.message?.includes('Can\'t reach database server') || 
        err?.code === 'P2021' || err?.message?.includes('does not exist')) {
      return NextResponse.json({ error: "Database unavailable. Please try again." }, { status: 503 });
    }
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
