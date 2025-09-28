'use server';

import { signIn, signOut, auth } from '@/auth';
import { RegisterSchema } from '@/lib/definitions';
import { AuthError } from 'next-auth';
import prisma from '@/lib/prisma';
import bcrypt from 'bcryptjs';
import { z } from 'zod';

export async function authenticate(
  prevState: string | undefined,
  formData: FormData,
) {
  try {
    await signIn('credentials', Object.fromEntries(formData));
  } catch (error) {
    if (error instanceof AuthError) {
      switch (error.type) {
        case 'CredentialsSignin':
          return 'Invalid credentials.';
        default:
          return 'Something went wrong.';
      }
    }
    throw error;
  }
}

export async function register(values: z.infer<typeof RegisterSchema>) {
    const validatedFields = RegisterSchema.safeParse(values);

    if (!validatedFields.success) {
        return { error: "Invalid fields!" };
    }

    const { email, password, name } = validatedFields.data;
    const hashedPassword = await bcrypt.hash(password, 10);

    const existingUser = await prisma.user.findUnique({
        where: { email }
    });

    if (existingUser) {
        return { error: "Email already in use!" };
    }

    try {
        await prisma.user.create({
            data: {
                name,
                email,
                password: hashedPassword,
            },
        });
    } catch (error) {
        return { error: "Something went wrong. Could not create user." };
    }
    
    return { success: "User created! Please login." };
}

export async function doSignOut() {
    await signOut({ redirectTo: '/' });
}
