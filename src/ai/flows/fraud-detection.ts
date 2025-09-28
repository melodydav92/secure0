'use server';

/**
 * @fileOverview Implements a fraud detection AI agent that analyzes transaction patterns and flags potentially fraudulent activities.
 *
 * - detectFraud - A function that analyzes transaction data and flags potentially fraudulent activities.
 * - DetectFraudInput - The input type for the detectFraud function.
 * - DetectFraudOutput - The return type for the detectFraud function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const DetectFraudInputSchema = z.object({
  transactionHistory: z.array(
    z.object({
      id: z.string(),
      type: z.string(),
      amount: z.number(),
      description: z.string().nullable(),
      senderId: z.string().nullable(),
      receiverId: z.string().nullable(),
      userId: z.string(),
      createdAt: z.string(),
    })
  ).describe('The transaction history of the user.'),
  currentTransaction: z.object({
    id: z.string(),
    type: z.string(),
    amount: z.number(),
    description: z.string().nullable(),
    senderId: z.string().nullable(),
    receiverId: z.string().nullable(),
    userId: z.string(),
    createdAt: z.string(),
  }).describe('The current transaction to analyze.'),
});
export type DetectFraudInput = z.infer<typeof DetectFraudInputSchema>;

const DetectFraudOutputSchema = z.object({
  isFraudulent: z.boolean().describe('Whether the transaction is potentially fraudulent.'),
  fraudExplanation: z.string().describe('The explanation of why the transaction is considered fraudulent.'),
});
export type DetectFraudOutput = z.infer<typeof DetectFraudOutputSchema>;

export async function detectFraud(input: DetectFraudInput): Promise<DetectFraudOutput> {
  return detectFraudFlow(input);
}

const prompt = ai.definePrompt({
  name: 'detectFraudPrompt',
  input: {schema: DetectFraudInputSchema},
  output: {schema: DetectFraudOutputSchema},
  prompt: `You are a fraud detection expert analyzing banking transactions.

You are provided with the user's transaction history and the current transaction.
Your goal is to determine if the current transaction is potentially fraudulent based on the history.

Transaction History:
{{#each transactionHistory}}
  - Type: {{type}}, Amount: {{amount}}, Description: {{description}}, CreatedAt: {{createdAt}}
{{/each}}

Current Transaction:
  - Type: {{currentTransaction.type}}, Amount: {{currentTransaction.amount}}, Description: {{currentTransaction.description}}, CreatedAt: {{currentTransaction.createdAt}}

Consider factors such as:
- Unusual transaction amounts compared to historical transactions.
- Infrequent transaction patterns.
- Suspicious transaction descriptions.
- New or unusual recipients.

Based on your analysis, determine if the transaction is fraudulent and provide an explanation.
Set the isFraudulent field to true if you suspect fraud, otherwise false.
`,
});

const detectFraudFlow = ai.defineFlow(
  {
    name: 'detectFraudFlow',
    inputSchema: DetectFraudInputSchema,
    outputSchema: DetectFraudOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
