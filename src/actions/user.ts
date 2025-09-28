'use server';

import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { LoginSchema, ProfileSchema, RegisterSchema } from "@/lib/definitions";
import { signIn } from "@/auth";
import { AuthError } from "next-auth";
import bcrypt from "bcryptjs";
import { getUserId } from "@/lib/data";

export async function updateProfile(values: z.infer<typeof ProfileSchema>) {
    const validatedFields = ProfileSchema.safeParse(values);
    if (!validatedFields.success) {
        return { error: "Invalid fields." };
    }
    
    const userId = await getUserId();
    if (!userId) {
        return { error: "User not authenticated." };
    }

    const { name, email } = validatedFields.data;

    try {
        await prisma.user.update({
            where: { id: userId },
            data: { name, email }
        });
        revalidatePath('/settings');
        return { success: "Profile updated successfully!" };
    } catch (error) {
        // Could be a unique constraint violation on email
        return { error: "Failed to update profile. Email might be in use." };
    }
}

export async function authenticate(
  prevState: string | undefined,
  formData: FormData,
) {
  try {
    await signIn('credentials', Object.fromEntries(formData));
    return 'Success';
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

function generateAccountNumber() {
  return Math.random().toString().slice(2,12);
}

export async function register(
  prevState: string | undefined,
  formData: FormData,
) {
  const validatedFields = RegisterSchema.safeParse(
    Object.fromEntries(formData.entries())
  );

  if (!validatedFields.success) {
    return "Invalid form data.";
  }

  const { name, email, password } = validatedFields.data;
  const hashedPassword = await bcrypt.hash(password, 10);
  
  try {
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return "User with this email already exists.";
    }

    await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        accountNo: generateAccountNumber(),
        balance: 0, // Initial balance
      },
    });

    // Optionally sign in the user directly after registration
    await signIn('credentials', { email, password });
    return 'Success';

  } catch (error) {
    console.error(error);
    return "An error occurred during registration.";
  }
}

export { signOut } from "@/auth";