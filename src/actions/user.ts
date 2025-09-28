'use server';

import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { ProfileSchema, RegisterSchema, CurrencyConversionSchema } from "@/lib/definitions";
import { getUserId } from "@/lib/data";
import { getExchangeRate } from "@/ai/flows/currency-conversion";

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

export async function fetchExchangeRate(fromCurrency: string, toCurrency: string) {
    if (fromCurrency === toCurrency) {
        return { rate: 1 };
    }
    try {
        const result = await getExchangeRate({ fromCurrency, toCurrency });
        return { rate: result.rate };
    } catch (error) {
        console.error("Error fetching exchange rate:", error);
        return { error: "Could not fetch exchange rate." };
    }
}

export async function convertCurrency(values: z.infer<typeof CurrencyConversionSchema>) {
    const validatedFields = CurrencyConversionSchema.safeParse(values);
    if (!validatedFields.success) {
        return { error: "Invalid currency selected." };
    }

    const userId = await getUserId();
    if (!userId) {
        return { error: "User not authenticated." };
    }

    const { toCurrency } = validatedFields.data;

    try {
        const user = await prisma.user.findUnique({ where: { id: userId } });
        if (!user) {
            return { error: "User not found." };
        }
        if (user.currency === toCurrency) {
            return { error: "Cannot convert to the same currency."};
        }

        const { rate } = await fetchExchangeRate(user.currency, toCurrency);
        if (!rate) {
             return { error: "Could not fetch exchange rate." };
        }

        const newBalance = user.balance * rate;

        await prisma.$transaction(async (tx) => {
            await tx.user.update({
                where: { id: userId },
                data: {
                    balance: newBalance,
                    currency: toCurrency,
                }
            });

            await tx.transaction.create({
                data: {
                    userId: userId,
                    type: 'conversion',
                    amount: 0, // No change in value, just currency
                    description: `Converted balance from ${user.currency} to ${toCurrency} at rate ${rate.toFixed(4)}`,
                    status: 'completed',
                }
            });
        });

        revalidatePath('/dashboard');
        revalidatePath('/settings');
        revalidatePath('/transactions');
        return { success: `Balance successfully converted to ${toCurrency}.` };

    } catch (error) {
        console.error("Currency conversion failed", error);
        return { error: "Currency conversion failed." };
    }
}
