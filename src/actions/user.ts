'use server';

import { auth } from "@/auth";
import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import bcrypt from 'bcryptjs';
import { z } from "zod";
import { PasswordSchema, ProfileSchema } from "@/lib/definitions";

export async function updateProfile(values: z.infer<typeof ProfileSchema>) {
    const session = await auth();
    if (!session?.user?.id) return { error: "Not authenticated" };

    const validatedFields = ProfileSchema.safeParse(values);
    if (!validatedFields.success) {
        return { error: "Invalid fields." };
    }
    
    const { name, email } = validatedFields.data;

    try {
        await prisma.user.update({
            where: { id: session.user.id },
            data: { name, email }
        });
        revalidatePath('/settings');
        return { success: "Profile updated successfully!" };
    } catch (error) {
        // Could be a unique constraint violation on email
        return { error: "Failed to update profile. Email might be in use." };
    }
}

export async function updatePassword(values: z.infer<typeof PasswordSchema>) {
    const session = await auth();
    if (!session?.user?.id) return { error: "Not authenticated" };

    const validatedFields = PasswordSchema.safeParse(values);
    if (!validatedFields.success) {
        return { error: "Invalid fields." };
    }

    const { currentPassword, newPassword } = validatedFields.data;

    const user = await prisma.user.findUnique({ where: { id: session.user.id } });
    if (!user?.password) return { error: "User not found." };
    
    const isPasswordCorrect = await bcrypt.compare(currentPassword, user.password);
    if (!isPasswordCorrect) return { error: "Incorrect current password." };
    
    const hashedNewPassword = await bcrypt.hash(newPassword, 10);
    
    try {
        await prisma.user.update({
            where: { id: session.user.id },
            data: { password: hashedNewPassword }
        });
        return { success: "Password updated successfully!" };
    } catch (error) {
        return { error: "Failed to update password." };
    }
}
