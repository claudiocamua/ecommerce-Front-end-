import NextAuth from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import CredentialsProvider from "next-auth/providers/credentials";
import type { NextAuthOptions, User } from "next-auth";
import type { JWT } from "next-auth/jwt";

declare module "next-auth" {
  interface User {
    accessToken?: string;
    id: string;
  }
  
  interface Session {
    accessToken?: string;
    user: {
      id: string;
      email?: string | null;
      name?: string | null;
      image?: string | null;
    };
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    accessToken?: string;
    id?: string;
  }
}

export const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID || "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
    }),
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        try {
          const response = await fetch(
            `${process.env.NEXT_PUBLIC_API_URL}/auth/login`,
            {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                email: credentials.email,
                password: credentials.password,
              }),
            }
          );

          const data = await response.json();

          if (response.ok && data.access_token) {
            // Retornar user object com accessToken
            return {
              id: data.user_id,
              email: credentials.email,
              accessToken: data.access_token,
            } as User;
          }

          return null;
        } catch (error) {
          console.error("Erro no authorize:", error);
          return null;
        }
      },
    }),
  ],

  callbacks: {
    async signIn({ user, account }) {
      if (account?.provider === "google") {
        try {
          const response = await fetch(
            `${process.env.NEXT_PUBLIC_API_URL}/auth/google`,
            {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                token: account.id_token,
              }),
            }
          );

          const data = await response.json();

          if (response.ok && data.access_token) {
            // Armazenar token no user object
            user.accessToken = data.access_token;
            user.id = data.user_id;
            return true;
          }

          return false;
        } catch (error) {
          console.error("Erro no signIn:", error);
          return false;
        }
      }

      return true;
    },

    async jwt({ token, user }) {
      if (user) {
        token.accessToken = user.accessToken;
        token.id = user.id;
      }
      return token;
    },

    async session({ session, token }) {
      if (token) {
        session.accessToken = token.accessToken;
        session.user.id = token.id as string;
      }
      return session;
    },
  },

  pages: {
    signIn: "/login",
  },

  session: {
    strategy: "jwt",
  },

  secret: process.env.NEXTAUTH_SECRET,
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };