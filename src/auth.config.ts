import type { NextAuthConfig } from 'next-auth';
 
export const authConfig = {
  pages: {
    signIn: '/auth/login',
  },
  callbacks: {
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user;
      const isPublicRoute = ['/auth/login', '/auth/register', '/'].includes(nextUrl.pathname);

      if (isPublicRoute) {
        if (isLoggedIn) {
          return Response.redirect(new URL('/dashboard', nextUrl));
        }
        return true;
      }

      if (!isLoggedIn) {
        return false;
      }
      
      return true;
    },
    async session({ session, token }) {
      if (token?.sub && session.user) {
        session.user.id = token.sub;
      }
      if (token?.accountNo && session.user) {
        (session.user as any).accountNo = token.accountNo;
      }
      return session;
    },
    async jwt({ token, user }) {
        if (user) {
            token.sub = user.id;
            if ('accountNo' in user) {
                (token as any).accountNo = user.accountNo;
            }
        }
        return token;
    }
  },
  providers: [],
} satisfies NextAuthConfig;
