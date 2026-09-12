import NextAuth from "next-auth";
import Google from "next-auth/providers/google";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { prisma } from "@printartz/db";

export const { handlers, auth, signIn, signOut } = NextAuth({
  // The engine-free generated client is runtime-compatible with the adapter;
  // its types differ from @prisma/client's PrismaClient, so cast to satisfy it.
  adapter: PrismaAdapter(prisma as unknown as Parameters<typeof PrismaAdapter>[0]),
  session: { strategy: "database" },
  // Dev runs on localhost behind no proxy; trust the incoming host header.
  trustHost: true,
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    }),
  ],
});
