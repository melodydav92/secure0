import NextAuth from 'next-auth';
import Credentials from 'next-auth/providers/credentials';
import prisma from '@/lib/prisma';
import bcrypt from 'bcryptjs';
import { authConfig } from './auth.config';
import { LoginSchema } from './lib/definitions';
 
async function getUser(email: string) {
    try {
        const user = await prisma.user.findUnique({ where: { email } });
        return user;
    } catch (error) {
        console.error('Failed to fetch user:', error);
        throw new Error('Failed to fetch user.');
    }
}
 
export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  providers: [
    Credentials({
        async authorize(credentials) {
            const parsedCredentials = LoginSchema.safeParse(credentials);

            if (parsedCredentials.success) {
                const { email, password } = parsedCredentials.data;
                const user = await getUser(email);
                if (!user || !user.password) return null;

                const passwordsMatch = await bcrypt.compare(password, user.password);
                if (passwordsMatch) return user;
            }

            return null;
        },
    }),
  ],
  session: { strategy: "jwt" },
});
