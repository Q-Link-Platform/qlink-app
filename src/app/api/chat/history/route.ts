import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";
import { cleanHandle } from "@/lib/handle-utils";

function buildRoomId(a: string, b: string) {
  return [a, b].sort().join(":");
}

// In-memory peer resolution cache (10 min TTL) - cuts 2 redundant DB queries out of every poll
interface CachedPeerResolution {
  peer: {
    id: string;
    handle: string | null;
    name: string | null;
    email: string | null;
    image: string | null;
    publicKeyString: string | null;
  };
  roomId: string;
  cachedAt: number;
}
const peerResolutionCache = new Map<string, CachedPeerResolution>();
const CACHE_TTL_MS = 10 * 60 * 1000;

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user || !(session.user as any).id) {
      return NextResponse.json({ error: "Unauthorized. Please sign in." }, { status: 401 });
    }

    const url = new URL(request.url);
    const peerHandle = url.searchParams.get("peerHandle");

    if (!peerHandle) {
      return NextResponse.json({ error: "Missing peerHandle" }, { status: 400 });
    }

    const meId = (session.user as any).id as string;
    const cleanedPeerHandle = cleanHandle(peerHandle);
    const cacheKey = `${meId}:${cleanedPeerHandle.toLowerCase()}`;

    const cached = peerResolutionCache.get(cacheKey);
    let peer: {
      id: string;
      handle: string | null;
      name: string | null;
      email: string | null;
      image: string | null;
      publicKeyString: string | null;
    };
    let roomId: string;

    if (cached && Date.now() - cached.cachedAt < CACHE_TTL_MS) {
      peer = cached.peer;
      roomId = cached.roomId;
    } else {
      // Multi-tier peer resolution: exact handle -> ID -> fuzzy handle -> name
      let dbPeer = await prisma.user.findFirst({
        where: {
          OR: [
            { handle: { equals: cleanedPeerHandle, mode: "insensitive" } },
            { id: cleanedPeerHandle },
            { email: { equals: cleanedPeerHandle, mode: "insensitive" } },
          ],
        },
        select: {
          id: true,
          handle: true,
          name: true,
          email: true,
          image: true,
          publicKeyString: true,
        },
      });

      if (!dbPeer) {
        // Fallback fuzzy search (e.g. "Rohit_7779" -> "rohit")
        const baseHandle = cleanedPeerHandle.split(/[-_]/)[0];
        dbPeer = await prisma.user.findFirst({
          where: {
            OR: [
              { handle: { contains: baseHandle, mode: "insensitive" } },
              { name: { contains: baseHandle, mode: "insensitive" } },
            ],
          },
          select: {
            id: true,
            handle: true,
            name: true,
            email: true,
            image: true,
            publicKeyString: true,
          },
        });
      }

      if (!dbPeer) {
        return NextResponse.json({ error: `Peer "@${peerHandle}" not found.` }, { status: 404 });
      }

      if (dbPeer.id === meId) {
        return NextResponse.json({ error: "Cannot chat with yourself" }, { status: 400 });
      }

      peer = dbPeer;
      roomId = buildRoomId(meId, peer.id);

      // Auto-create/ensure accepted connection for seamless messaging
      const accepted = await prisma.friendRequest.findFirst({
        where: {
          OR: [
            { fromUserId: meId, toUserId: peer.id },
            { fromUserId: peer.id, toUserId: meId },
          ],
        },
      });

      if (!accepted) {
        await prisma.friendRequest.create({
          data: {
            fromUserId: meId,
            toUserId: peer.id,
            categories: "Friend",
            message: "Connected",
            status: "ACCEPTED",
          },
        }).catch(() => {});
      } else if (accepted.status !== "ACCEPTED") {
        await prisma.friendRequest.update({
          where: { id: accepted.id },
          data: { status: "ACCEPTED" },
        }).catch(() => {});
      }

      peerResolutionCache.set(cacheKey, {
        peer,
        roomId,
        cachedAt: Date.now(),
      });
    }

    const messages = await prisma.message.findMany({
      where: { roomId },
      orderBy: { createdAt: "asc" },
      select: {
        id: true,
        content: true,
        createdAt: true,
        senderId: true,
        roomId: true,
        status: true,
        deliveredAt: true,
        readAt: true,
        isEdited: true,
        editedAt: true,
      },
    });

    // Auto-mark unread messages as READ
    const unreadMessageIds = messages
      .filter((m: any) => m.senderId === peer.id && m.status !== "READ")
      .map((m: any) => m.id);

    if (unreadMessageIds.length > 0) {
      const now = new Date();
      prisma.message.updateMany({
        where: { id: { in: unreadMessageIds } },
        data: { status: "READ", readAt: now, deliveredAt: now },
      }).catch(() => {});

      for (const m of messages) {
        if (m.senderId === peer.id && m.status !== "READ") {
          m.status = "READ";
          (m as any).readAt = now.toISOString();
        }
      }
    }

    // Query attachments for these messages so images and videos render inline seamlessly
    const messageIds = messages.map((m: any) => m.id);
    let attachments: any[] = [];
    if (messageIds.length > 0) {
      try {
        attachments = await prisma.attachment.findMany({
          where: {
            OR: [
              { messageId: { in: messageIds } },
              { roomId },
            ],
          },
          select: {
            id: true,
            messageId: true,
            kind: true,
            originalName: true,
            mimeType: true,
            sizeBytes: true,
            bucket: true,
            objectKey: true,
            createdAt: true,
          },
        });
      } catch (attErr) {
        console.warn("[chat/history] Failed to fetch attachments from primary prisma:", attErr);
      }
    }

    const attachmentsByMessageId = new Map<string, any[]>();
    for (const att of attachments) {
      const serialized = {
        id: att.id,
        kind: att.kind,
        originalName: att.originalName,
        mimeType: att.mimeType,
        sizeBytes: att.sizeBytes ? att.sizeBytes.toString() : "0",
        bucket: att.bucket,
        objectKey: att.objectKey,
        createdAt: att.createdAt,
      };
      if (att.messageId) {
        const list = attachmentsByMessageId.get(att.messageId) || [];
        list.push(serialized);
        attachmentsByMessageId.set(att.messageId, list);
      }
    }

    return NextResponse.json({
      roomId,
      peer: {
        id: peer.id,
        handle: peer.handle,
        name: peer.name,
        email: peer.email,
        image: peer.image,
        publicKeyString: peer.publicKeyString,
      },
      messages: messages.map((m) => ({
        ...m,
        attachments: attachmentsByMessageId.get(m.id) || [],
      })),
    });
  } catch (err: any) {
    console.error("[chat/history]", err);
    return NextResponse.json({ error: err?.message || "Internal server error" }, { status: 500 });
  }
}
