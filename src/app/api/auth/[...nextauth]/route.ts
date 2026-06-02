import NextAuth from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import AzureADProvider from "next-auth/providers/azure-ad";
import GitHubProvider from "next-auth/providers/github";
import CredentialsProvider from "next-auth/providers/credentials";
import type { NextAuthOptions } from "next-auth";
import { PrismaAdapter } from "@next-auth/prisma-adapter";
import { prisma } from "@/lib/prisma";

function generateHandle(base: string | null | undefined) {
  const core = (base || "user").split("@")[0].replace(/[^a-zA-Z0-9]/g, "").toLowerCase() || "user";
  const suffix = Math.floor(1000 + Math.random() * 9000);
  return `${core}-${suffix}`;
}

const useSecureCookies = process.env.NEXTAUTH_URL?.startsWith("https://") ?? false;
const cookiePrefix = useSecureCookies ? "__Secure-" : "";
const sameSiteState = useSecureCookies ? "none" : "lax";

// Force secure cookies ONLY for HTTPS (ngrok/production)
// This dynamic check allows it to run seamlessly on localhost:3002 without State cookie issues.
export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      checks: process.env.NODE_ENV === "production" ? ["state"] : [],
    }),
    AzureADProvider({
      clientId: process.env.AUTH_MICROSOFT_ENTRA_ID_ID!,
      clientSecret: process.env.AUTH_MICROSOFT_ENTRA_ID_SECRET!,
      tenantId: process.env.AUTH_MICROSOFT_ENTRA_ID_TENANT_ID,
      checks: process.env.NODE_ENV === "production" ? ["state"] : [],
    }),
    GitHubProvider({
      clientId: process.env.GITHUB_ID!,
      clientSecret: process.env.GITHUB_SECRET!,
      authorization: {
        params: {
          scope: "read:user user:email",
        },
      },
      // Disable state check for cross-origin flows (less secure but works with ngrok)
      // For production, keep state enabled
      checks: process.env.NODE_ENV === "production" ? ["state"] : [],
      profile(profile) {
        return {
          id: profile.id.toString(),
          name: profile.name || profile.login,
          email: profile.email,
          image: profile.avatar_url,
        };
      },
    }),
    CredentialsProvider({
      id: "phone-otp",
      name: "Phone OTP",
      credentials: {
        phone: { label: "Phone", type: "text" },
        otp: { label: "OTP", type: "text" },
      },
      async authorize(credentials) {
        if (!credentials?.phone || !credentials?.otp) {
          throw new Error("Phone and OTP are required");
        }

        const phone = credentials.phone.trim();
        const code = credentials.otp.trim();

        // 1. Find OTP code in database
        const otpRecord = await prisma.otpCode.findUnique({
          where: { phone },
        });

        if (!otpRecord) {
          throw new Error("No active OTP request found for this number");
        }

        // 2. Validate expiration
        if (new Date() > otpRecord.expiresAt) {
          await prisma.otpCode.delete({ where: { phone } }).catch(() => {});
          throw new Error("Verification code has expired");
        }

        // 3. Match code
        if (otpRecord.code !== code) {
          throw new Error("Invalid verification code");
        }

        // 4. Delete used OTP record
        await prisma.otpCode.delete({ where: { phone } }).catch(() => {});

        // 5. Find or create User
        let user = await prisma.user.findUnique({
          where: { phoneNumber: phone },
        });

        if (!user) {
          // Generate a premium handle for new phone user
          const tempHandle = generateHandle(`user_${phone.slice(-4)}`);
          user = await prisma.user.create({
            data: {
              name: `User ${phone.slice(-4)}`,
              phoneNumber: phone,
              handle: tempHandle,
              points: 0,
              aura_percentage: 0,
              blue_tick_status: "NONE",
            },
          });
        }

        return {
          ...user,
          handle: user.handle ?? undefined,
          phoneNumber: user.phoneNumber ?? undefined,
          sessionToken: user.sessionToken ?? undefined,
        };
      },
    }),
  ],
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
    updateAge: 24 * 60 * 60, // Update session every 24 hours
  },
  secret: process.env.NEXTAUTH_SECRET || "fallback-secret-for-dev-only-change-in-production",
  pages: {
    signIn: "/",
    error: "/",
  },
  cookies: {
    sessionToken: {
      name: `${cookiePrefix}next-auth.session-token`,
      options: {
        httpOnly: true,
        sameSite: "lax",
        path: "/",
        secure: useSecureCookies,
        maxAge: 30 * 24 * 60 * 60, // 30 days persistent session
      },
    },
    state: {
      name: `${cookiePrefix}next-auth.state`,
      options: {
        httpOnly: true,
        sameSite: sameSiteState, // Required for cross-origin OAuth redirect on HTTPS
        path: "/",
        secure: useSecureCookies, // Must be true with sameSite: none
        maxAge: 900, // 15 minutes
      },
    },
    callbackUrl: {
      name: `${cookiePrefix}next-auth.callback-url`,
      options: {
        httpOnly: true,
        sameSite: "lax",
        path: "/",
        secure: useSecureCookies,
      },
    },
    csrfToken: {
      name: `${cookiePrefix}next-auth.csrf-token`,
      options: {
        httpOnly: true,
        sameSite: "lax",
        path: "/",
        secure: useSecureCookies,
      },
    },
    pkceCodeVerifier: {
      name: `${cookiePrefix}next-auth.pkce.code_verifier`,
      options: {
        httpOnly: true,
        sameSite: sameSiteState, // Required for PKCE flow with redirects
        path: "/",
        secure: useSecureCookies,
        maxAge: 900,
      },
    },
  },
  useSecureCookies,
  callbacks: {
    async signIn({ account, profile, user }) {
      // Remove ext_expires_in to avoid database column error
      if (account && "ext_expires_in" in account) {
        delete (account as any).ext_expires_in;
      }

      // Debug logging for GitHub auth issues
      if (account?.provider === "github") {
        console.log("[GitHub Auth] Profile:", { 
          email: profile?.email, 
          name: profile?.name || (profile as any)?.login,
          hasUser: !!user 
        });
      }

      // Handle account linking for existing users with same email
      if (account && profile?.email) {
        const existingUser = await prisma.user.findUnique({
          where: { email: profile.email },
          include: { accounts: true },
        });

        if (existingUser) {
          // Check if this provider account is already linked
          const existingAccount = existingUser.accounts.find(
            (a) => a.provider === account.provider && a.providerAccountId === account.providerAccountId
          );

          if (!existingAccount) {
            // Link the new provider to existing user
            try {
              await prisma.account.create({
                data: {
                  userId: existingUser.id,
                  type: account.type,
                  provider: account.provider!,
                  providerAccountId: account.providerAccountId!,
                  refresh_token: account.refresh_token,
                  access_token: account.access_token,
                  expires_at: account.expires_at,
                  token_type: account.token_type,
                  scope: account.scope,
                  id_token: account.id_token,
                  session_state: account.session_state,
                },
              });
            } catch (e) {
              console.error("Failed to link account:", e);
            }
          }
        }
      }

      // Generate a brand new unique sessionToken to enforce single active session
      if (user && user.id) {
        const newSessionToken = Math.random().toString(36).substring(2) + Date.now().toString(36);
        try {
          await prisma.user.update({
            where: { id: user.id },
            data: { sessionToken: newSessionToken },
          });
          // Attach to user object so jwt callback can read it
          (user as any).sessionToken = newSessionToken;
        } catch (e) {
          console.error("Failed to set sessionToken on login:", e);
        }
      }

      return true;
    },
    async jwt({ token, user }) {
      // On initial sign-in, copy over id, handle and sessionToken from the freshly logged-in user
      if (user) {
        token.id = (user as any).id;
        token.handle = (user as any).handle;
        token.sessionToken = (user as any).sessionToken;
      }
      return token;
    },
    async session({ session, token }) {
      if (!session.user || !token || !token.id) return session;

      const sUser = session.user as any;
      sUser.id = token.id;

      try {
        // Fetch user from DB to verify active sessionToken and get details
        const dbUser = await prisma.user.findUnique({
          where: { id: token.id as string },
        });

        // 1. Session Mismatch Check:
        // If user doesn't exist, or their stored database sessionToken differs from the token they logged in with,
        // it means they logged in on a new device/browser, invalidating this old session!
        if (process.env.NODE_ENV !== "development" && dbUser && dbUser.sessionToken && dbUser.sessionToken !== token.sessionToken) {
          console.log(`[SESSION ENFORCER] Invalidating session for user ID: ${token.id}. Reason: Mismatched session token.`);
          return { expires: new Date(0).toISOString() } as any;
        }

        if (dbUser) {
          // Expose database real-time attributes to session
          sUser.points = dbUser.points ?? 0;
          sUser.blue_tick_status = dbUser.blue_tick_status ?? "NONE";
          sUser.aura_percentage = dbUser.aura_percentage ?? 0;
          sUser.image = dbUser.image ?? sUser.image ?? null;

          // 2. Handle Logic:
          let handle = dbUser.handle;
          if (!handle) {
            handle = generateHandle(dbUser.email ?? dbUser.name ?? undefined);
            for (let i = 0; i < 5; i++) {
              try {
                const updated = await prisma.user.update({
                  where: { id: dbUser.id },
                  data: { handle },
                });
                handle = updated.handle ?? handle;
                break;
              } catch {
                handle = generateHandle(dbUser.email ?? dbUser.name ?? undefined);
              }
            }
          }
          
          (token as any).handle = handle;
          sUser.handle = handle;
        }
      } catch (err) {
        console.error("Session verification error:", err);
      }

      // If token already has a handle, make sure it's exposed
      if (token.handle) {
        sUser.handle = token.handle;
      }

      return session;
    },
  },
  events: {
    async createUser({ user }) {
      // Ensure newly created users get a unique handle
      if (!(user as any).handle) {
        let handle = generateHandle(user.email ?? user.name ?? undefined);
        // Best-effort: retry a few times if collision
        for (let i = 0; i < 5; i++) {
          try {
            await prisma.user.update({
              where: { id: user.id },
              data: { handle },
            });
            break;
          } catch (err) {
            handle = generateHandle(user.email ?? user.name ?? undefined);
          }
        }
      }
    },
  },
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
