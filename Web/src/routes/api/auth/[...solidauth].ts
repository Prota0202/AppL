import Credentials from "@auth/core/providers/credentials";
import { SolidAuth, SolidAuthConfig } from "@auth/solid-start"
import bcrypt from "bcryptjs";
import db from "~/lib/db";

const authOptions = {
  basePath: "/api/auth",
  secret: process.env.AUTH_SECRET,
  providers: [
    Credentials({
      name: 'Credentials',
      credentials: {
        email: { label: 'Email', type: 'text' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        const user = await db.user.findUnique({
          where: { email: credentials.email as string },
        });

        if (!user || !user.password || (user.provider !== 'CREDENTIALS')) return null;

        const isValid = await bcrypt.compare(credentials.password as string, user.password);
        if (!isValid) return null;

        return {
          id: user.id.toString(),
          email: user.email,
          name: user.name,
        };
      },
    }),
  ],
  callbacks: {
    async session({ session, token }) {
      if (token && token.id) {
        session.user.id = token.id as string;
      }
      return session;
    },
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
      }
      return token;
    },
  },
  pages: {
    signIn: '/login',
  },
  debug: process.env.NODE_ENV === "development",
} satisfies SolidAuthConfig;

export { authOptions };
export const { GET, POST } = SolidAuth(authOptions)