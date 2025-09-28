'use server';

import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { ProfileSchema } from "@/lib/definitions";

// Mock user ID for now. In a real app, you'd get this from the session.
const MOCK_USER_ID = 'clx1234567890abcdefgh'; 

export async function updateProfile(values: z.infer<typeof ProfileSchema>) {
    const validatedFields = ProfileSchema.safeParse(values);
    if (!validatedFields.success) {
        return { error: "Invalid fields." };
    }
    
    const { name, email } = validatedFields.data;

    try {
        await prisma.user.update({
            where: { id: MOCK_USER_ID },
            data: { name, email }
        });
        revalidatePath('/settings');
        return { success: "Profile updated successfully!" };
    } catch (error) {
        // Could be a unique constraint violation on email
        return { error: "Failed to update profile. Email might be in use." };
    }
}
