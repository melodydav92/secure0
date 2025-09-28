'use server';

import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { ProfileSchema, RegisterSchema } from "@/lib/definitions";
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

    const { name, email, currency } = validatedFields.data;

    try {
        await prisma.user.update({
            where: { id: userId },
            data: { name, email, currency }
        });
        revalidatePath('/settings');
        revalidatePath('/dashboard');
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
  return 'Success';
}

function generateAccountNumber() {
  return Math.random().toString().slice(2,12);
}

export async function register(
  prevState: string | undefined,
  formData: FormData,
) {
  const validatedFields = RegisterSchema.parse(
    Object.fromEntries(formData.entries())
  );

  const { name, email, password } = validatedFields;
  
  try {
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return "User with this email already exists.";
    }

    await prisma.user.create({
      data: {
        name,
        email,
        password: password, // Storing password in plaintext as bcrypt is removed
        accountNo: generateAccountNumber(),
        balance: 1000, // Initial balance for new users
      },
    });

    // Directly navigate to dashboard after registration
    revalidatePath('/dashboard');
    return 'Success';

  } catch (error) {
    console.error(error);
    return "An error occurred during registration.";
  }
}

export async function logout() {
  // Mock logout
}
