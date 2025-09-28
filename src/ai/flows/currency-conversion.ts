'use server';

/**
 * @fileOverview A currency conversion AI agent that provides exchange rates.
 *
 * - getExchangeRate - A function that returns the exchange rate between two currencies.
 * - GetExchangeRateInput - The input type for the getExchangeRate function.
 * - GetExchangeRateOutput - The return type for the getExchangeRate function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const GetExchangeRateInputSchema = z.object({
  fromCurrency: z.string().describe('The currency to convert from (e.g., USD).'),
  toCurrency: z.string().describe('The currency to convert to (e.g., EUR).'),
});
export type GetExchangeRateInput = z.infer<typeof GetExchangeRateInputSchema>;

const GetExchangeRateOutputSchema = z.object({
  rate: z.number().describe('The exchange rate from the source currency to the target currency.'),
});
export type GetExchangeRateOutput = z.infer<typeof GetExchangeRateOutputSchema>;

export async function getExchangeRate(input: GetExchangeRateInput): Promise<GetExchangeRateOutput> {
    return getExchangeRateFlow(input);
}

const prompt = ai.definePrompt({
    name: 'getExchangeRatePrompt',
    input: { schema: GetExchangeRateInputSchema },
    output: { schema: GetExchangeRateOutputSchema },
    prompt: `You are an API that provides real-time currency exchange rates.
    
    Provide the current exchange rate to convert 1 {{fromCurrency}} to {{toCurrency}}.
    
    Return ONLY the numeric exchange rate value. For example, if 1 USD = 0.92 EUR, you should return 0.92.
    `,
});

const getExchangeRateFlow = ai.defineFlow(
    {
        name: 'getExchangeRateFlow',
        inputSchema: GetExchangeRateInputSchema,
        outputSchema: GetExchangeRateOutputSchema,
    },
    async (input) => {
        const { output } = await prompt(input);
        return output!;
    }
);
