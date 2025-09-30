'use server';

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { ProfileSchema, RegisterSchema } from "@/lib/definitions";
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
    // Mock user registration
    console.log("Registering new user:", { name, email });
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
