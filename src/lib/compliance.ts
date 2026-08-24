import crypto from "crypto";
import { prisma } from "@/lib/prisma";

export interface ComplianceTargetAccount {
  userId: string;
  quantumHandle: string;
  displayName: string | null;
  registeredEmail: string | null;
  emailVerified: Date | null;
  accountStatus: string;
  createdAt: Date;
  updatedAt: Date;
  verifiedBadgeTier: string;
  auraPoints: number;
}

export interface CompliancePublicMetrics {
  totalPublicPosts: number;
  totalCommentsAuthored: number;
  publicBroadcastPostIds: string[];
}

export interface ComplianceSecurityAudit {
  sessionCount: number;
  hasActivePushSubscription: boolean;
  scheduledMessagesQueueCount: number;
}

export interface ComplianceReportPackage {
  complianceReportId: string;
  warrantReferenceId: string;
  generatedAt: string;
  generatedByAdmin: string;
  targetAccount: ComplianceTargetAccount;
  securityAudit: ComplianceSecurityAudit;
  publicPlatformActivity: CompliancePublicMetrics;
  encryptionDisclosure: {
    protocol: string;
    messageContentStatus: string;
    disclosureStatement: string;
  };
  integrityVerification: {
    algorithm: string;
    sha256Checksum: string;
  };
}

/**
 * Generates an authentic, structured Legal Compliance Data Package for a specified target account.
 */
export async function generateComplianceReport(
  targetIdentifier: string,
  warrantReferenceId: string,
  adminEmail: string
): Promise<ComplianceReportPackage | null> {
  const cleanId = targetIdentifier.replace(/^@/, "").trim();

  // Find user by handle, email, or id
  const user = await prisma.user.findFirst({
    where: {
      OR: [
        { handle: { equals: cleanId, mode: "insensitive" } },
        { email: { equals: cleanId, mode: "insensitive" } },
        { id: cleanId },
      ],
    },
    include: {
      posts: {
        select: { id: true, createdAt: true },
        take: 50,
      },
      comments: {
        select: { id: true },
      },
      pushSubscriptions: {
        select: { id: true },
      },
      scheduledMessages: {
        where: { status: "PENDING" },
        select: { id: true },
      },
      sessions: {
        select: { id: true },
      },
    },
  });

  if (!user) {
    return null;
  }

  const reportId = `LE-COMPLIANCE-${Date.now()}-${crypto.randomBytes(3).toString("hex").toUpperCase()}`;
  const generatedIso = new Date().toISOString();

  const targetAccount: ComplianceTargetAccount = {
    userId: user.id,
    quantumHandle: user.handle ? `@${user.handle}` : "UNREGISTERED",
    displayName: user.name,
    registeredEmail: user.email,
    emailVerified: user.emailVerified,
    accountStatus: "ACTIVE",
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
    verifiedBadgeTier: (user as any).blue_tick_status || "NONE",
    auraPoints: (user as any).points || 0,
  };

  const securityAudit: ComplianceSecurityAudit = {
    sessionCount: user.sessions?.length || 0,
    hasActivePushSubscription: (user.pushSubscriptions?.length || 0) > 0,
    scheduledMessagesQueueCount: user.scheduledMessages?.length || 0,
  };

  const publicPlatformActivity: CompliancePublicMetrics = {
    totalPublicPosts: user.posts?.length || 0,
    totalCommentsAuthored: user.comments?.length || 0,
    publicBroadcastPostIds: user.posts?.map((p: any) => p.id) || [],
  };

  const encryptionDisclosure = {
    protocol: "Curve25519_X25519_AES_GCM_256_AUTHENTICATED_E2EE",
    messageContentStatus: "ZERO_KNOWLEDGE_CLIENT_ENCRYPTED",
    disclosureStatement:
      "Direct message bodies and private media attachments are encrypted on end-user client devices using Curve25519 authenticated key exchange. The server operates as a zero-knowledge relay and possesses zero private decryption keys. Message content is mathematically unreadable on server infrastructure.",
  };

  // Compute deterministic SHA-256 integrity checksum of data payload
  const payloadToHash = JSON.stringify({
    reportId,
    warrantReferenceId,
    generatedIso,
    targetAccount,
    securityAudit,
    publicPlatformActivity,
  });

  const sha256Checksum = crypto.createHash("sha256").update(payloadToHash).digest("hex");

  return {
    complianceReportId: reportId,
    warrantReferenceId: warrantReferenceId.trim() || "WARRANT-REF-NOT-PROVIDED",
    generatedAt: generatedIso,
    generatedByAdmin: adminEmail,
    targetAccount,
    securityAudit,
    publicPlatformActivity,
    encryptionDisclosure,
    integrityVerification: {
      algorithm: "SHA-256",
      sha256Checksum,
    },
  };
}
