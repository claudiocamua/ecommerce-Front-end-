import NextAuth from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import CredentialsProvider from "next-auth/providers/credentials";

const handler = NextAuth({
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      authorization: {
        params: {
          prompt: "consent",
          access_type: "offline",
          response_type: "code"
        }
      }
    }),
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        try {
          const API_URL = process.env.NEXT_PUBLIC_API_URL || process.env.NEXT_PUBLIC_BACKEND_URL;
          
          const response = await fetch(`${API_URL}/auth/login`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              email: credentials?.email,
              password: credentials?.password,
            }),
          });

          const data = await response.json();

          if (response.ok && data.access_token) {
            return {
              id: data.user_id,
              email: credentials?.email,
              accessToken: data.access_token,
            };
          }

          return null;
        } catch (error) {
          console.error("Erro no login:", error);
          return null;
        }
      },
    }),
  ],
  callbacks: {
    async signIn({ user, account, profile }) {
      console.log(" SignIn callback:", { user, account, profile });

      if (account?.provider === "google") {
        try {
          const API_URL = process.env.NEXT_PUBLIC_API_URL || process.env.NEXT_PUBLIC_BACKEND_URL;
          
          // Enviar dados do Google para o backend
          const response = await fetch(`${API_URL}/auth/google`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              email: user.email,
              name: user.name,
              picture: user.image,
              google_id: account.providerAccountId,
            }),
          });

          const data = await response.json();
          console.log(" Resposta do backend:", data);

          if (response.ok && data.access_token) {
            // Armazenar token no user object
            user.accessToken = data.access_token;
            user.id = data.user_id;
            return true;
          }

          console.error(" Falha na autenticação Google no backend");
          return false;
        } catch (error) {
          console.error(" Erro ao autenticar com Google:", error);
          return false;
        }
      }

      return true;
    },
    async jwt({ token, user, account }) {
      console.log("🎫 JWT callback:", { token, user, account });

      if (user) {
        token.accessToken = user.accessToken;
        token.id = user.id;
      }

      return token;
    },
    async session({ session, token }) {
      console.log(" Session callback:", { session, token });

      if (token) {
        session.user.id = token.id;
        session.accessToken = token.accessToken;
      }

      return session;
    },
  },
  pages: {
    signIn: "/",
    error: "/",
  },
  secret: process.env.NEXTAUTH_SECRET,
  debug: true, 
});

export { handler as GET, handler as POST };