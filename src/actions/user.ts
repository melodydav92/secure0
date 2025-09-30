'use server';

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { ProfileSchema, RegisterSchema, LoginSchema } from "@/lib/definitions";
import { getUserId, getUserData } from "@/lib/data";

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
        // Mock profile update
        console.log(`Updating profile for user ${userId}:`, { name, email, currency });
        revalidatePath('/settings');
        revalidatePath('/dashboard');
        return { success: "Profile updated successfully!" };
    } catch (error) {
        return { error: "Failed to update profile." };
    }
}

export async function authenticate(
  prevState: string | undefined,
  formData: FormData,
) {
  const validatedFields = LoginSchema.safeParse(
    Object.fromEntries(formData.entries())
  );

  if (!validatedFields.success) {
    return "Invalid form data.";
  }
  
  // Mock authentication logic
  console.log("Attempting to authenticate user:", validatedFields.data.email);
  // This is where you would typically handle session creation.
  // For now, we just redirect.
  redirect('/dashboard');
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
    return "Invalid form data. Please check your inputs.";
  }

  const { name, email, password } = validatedFields.data;
  
  // Mock user registration
  console.log("Registering new user:", { name, email });
  revalidatePath('/dashboard');
  redirect('/dashboard');
}

export async function logout() {
  // Mock logout
  redirect('/');
}
