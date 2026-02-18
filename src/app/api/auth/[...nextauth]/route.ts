  import NextAuth, { AuthOptions } from "next-auth";
  import CredentialsProvider from "next-auth/providers/credentials";
  import { prisma } from "@/lib/prisma";
  import bcrypt from "bcryptjs";

  export const authOptions: AuthOptions = {
    providers: [
      CredentialsProvider({
        name: "Credentials",
        credentials: {
          email: { label: "Email", type: "email" },
          password: { label: "Пароль", type: "password" },
        },
        async authorize(credentials) {
          if (!credentials?.email || !credentials?.password) return null;

          const user = await prisma.user.findUnique({
            where: { email: credentials.email },
          });

          if (!user) {
            console.log("❌ Пользователь не найден");
            return null;
          }

          const isValid = await bcrypt.compare(credentials.password, user.password);
          if (!isValid) {
            console.log("❌ Неверный пароль");
            return null;
          }

          console.log("✅ Авторизация успешна:", user.email);

          return {
            id: user.id.toString(),
            name: user.name,
            email: user.email,
            role: user.role,
          };
        },
      }),
    ],

    pages: {
      signIn: "/auth/login",
    },

    callbacks: {
      async jwt({ token, user }) {
        // 👇 Добавляем роль в JWT при первой авторизации
        if (user) {
          token.id = user.id;
          token.role = user.role;
          token.avatarUrl = user.avatarUrl ?? null;
        }
        return token;
      },

      async session({ session, token }) {
        // 👇 Передаём роль из токена в сессию
        if (session.user) {
          session.user.id = token.id;
          session.user.role = token.role;
          session.user.avatarUrl = token.avatarUrl;
        }
        return session;
      },
    },

    session: {
      strategy: "jwt",
    },

    secret: process.env.NEXTAUTH_SECRET,
  };

  const handler = NextAuth(authOptions);

  export { handler as GET, handler as POST };