import NextAuth, { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import prisma from "@/lib/db";
import bcrypt from "bcrypt";
import { loginCache, checkRateLimit, resetRateLimit } from "@/lib/rateLimit";
import { validateEnv } from "@/lib/env";

// Fail-Closed: Validate mandatory environment variables before NextAuth initialization
validateEnv();

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        phone: { label: "رقم الهاتف", type: "text" },
        password: { label: "كلمة المرور", type: "password" }
      },
      async authorize(credentials, req) {
        if (!credentials?.phone || !credentials?.password) {
          throw new Error("يرجى إدخال رقم الهاتف وكلمة المرور");
        }

        const ip = req?.headers?.['x-forwarded-for'] || 'unknown-ip';
        const rateLimitKey = `${ip}_${credentials.phone}`;

        const { success } = checkRateLimit(loginCache, rateLimitKey, 5);
        if (!success) {
          throw new Error("تجاوزت الحد الأقصى لمحاولات الدخول الخاطئة. يرجى الانتظار لمدة 15 دقيقة.");
        }

        const user = await prisma.user.findUnique({
          where: { phone: credentials.phone }
        });

        if (!user) {
          throw new Error("رقم الهاتف أو كلمة المرور غير صحيحة");
        }

        if (user.passwordHash === "GUEST_NO_LOGIN") {
          throw new Error("هذا الرقم مرتبط بطلبات ضيف، يرجى إنشاء حساب وتوثيقه");
        }

        const isPasswordValid = await bcrypt.compare(credentials.password, user.passwordHash);

        if (!isPasswordValid) {
          throw new Error("رقم الهاتف أو كلمة المرور غير صحيحة");
        }

        // Reset the rate limit on successful login
        resetRateLimit(loginCache, rateLimitKey);

        return {
          id: user.id.toString(),
          name: user.fullName,
          phone: user.phone,
          role: user.role,
        };
      }
    })
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.role = (user as unknown).role;
        token.id = user.id;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        (session.user as unknown).role = token.role;
        (session.user as unknown).id = token.id;
      }
      return session;
    }
  },
  pages: {
    signIn: '/login', // Will be created later
  },
  session: {
    strategy: "jwt",
  },
  secret: process.env.NEXTAUTH_SECRET,
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };
