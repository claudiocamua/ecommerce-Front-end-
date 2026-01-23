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
            console.log("[NEXTAUTH AUTHORIZE] access_token recebido:", data.access_token.substring(0, 20) + "...");
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
      console.log("[NEXTAUTH SIGNIN] provider:", account?.provider, "user:", user);
      
      if (account?.provider === "google") {
        try {
          const url = `${process.env.NEXT_PUBLIC_API_URL}/auth/google/callback?token=${encodeURIComponent(account.id_token || '')}`;
          console.log("[NEXTAUTH SIGNIN GOOGLE] Chamando GET:", url.substring(0, 100) + "...");
          
          const response = await fetch(url, {
            method: "GET", 
          });

          const data = await response.json();
          console.log("[NEXTAUTH SIGNIN GOOGLE] Status:", response.status, "Resposta:", data);

          if (response.ok && data.access_token) {
            user.accessToken = data.access_token;
            user.id = data.user_id;
            console.log("[NEXTAUTH SIGNIN GOOGLE]  access_token salvo:", user.accessToken.substring(0, 20) + "...");
            return true;
          }

          console.error("[NEXTAUTH SIGNIN GOOGLE]  Erro:", response.status, data);
          return false;
        } catch (error) {
          console.error("[NEXTAUTH SIGNIN GOOGLE]  Exceção:", error);
          return false;
        }
      }

      return true;
    },

    async jwt({ token, user, account }) {
      console.log("[NEXTAUTH JWT] user:", user, "token antes:", token);
      if (user) {
        token.accessToken = user.accessToken;
        token.id = user.id;
        console.log("[NEXTAUTH JWT] token.accessToken atualizado:", token.accessToken?.substring(0, 20) + "...");
      }
      return token;
    },

    async session({ session, token }) {
      console.log("[NEXTAUTH SESSION] token:", token, "session antes:", session);
      if (token) {
        session.accessToken = token.accessToken;
        session.user.id = token.id as string;
        console.log("[NEXTAUTH SESSION] session.accessToken definido:", session.accessToken?.substring(0, 20) + "...");
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

  debug: true,
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };