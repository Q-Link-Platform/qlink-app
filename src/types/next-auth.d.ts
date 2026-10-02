import NextAuth, { DefaultSession } from "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      id?: string;
      handle?: string;
      publicKeyString?: string | null;
      encryptedPrivateKey?: string | null;
      e2eMasterSeed?: string | null;
    } & DefaultSession["user"];
  }

  interface User {
    id?: string;
    handle?: string;
    publicKeyString?: string | null;
    encryptedPrivateKey?: string | null;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id?: string;
    handle?: string;
  }
}
