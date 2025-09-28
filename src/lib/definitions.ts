import { z } from 'zod';

export const TransferSchema = z.object({
  recipientAccountNo: z.string().min(1, "Recipient account number is required."),
  amount: z.coerce.number().positive({ message: "Amount must be greater than 0." }),
  description: z.string().optional(),
});

export const DepositWithdrawSchema = z.object({
    amount: z.coerce.number().positive({ message: "Amount must be greater than 0." }),
});

export const ProfileSchema = z.object({
  name: z.string().min(2, { message: "Name is required." }),
  email: z.string().email({ message: "Please enter a valid email address." }),
});

export type FormattedTransaction = {
  id: string;
  type: string;
  amount: string;
  status: string;
  date: string;
  description: string;
};
