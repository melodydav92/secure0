'use server';

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { ProfileSchema, RegisterSchema, CurrencyConversionSchema } from "@/lib/definitions";
import { getUserId, getUserData } from "@/lib/data";
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
        const user = await getUserData();
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

        // Mock currency conversion
        console.log(`Converted balance for user ${userId} to ${toCurrency}. New balance: ${newBalance}`);

        revalidatePath('/dashboard');
        revalidatePath('/settings');
        revalidatePath('/transactions');
        return { success: `Balance successfully converted to ${toCurrency}.` };

    } catch (error) {
        console.error("Currency conversion failed", error);
        return { error: "Currency conversion failed." };
    }
}
