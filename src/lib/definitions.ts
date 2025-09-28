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
  currency: z.enum(['USD', 'GBP', 'JPY', 'EUR']).optional(),
  isAdmin: z.boolean().optional(),
});

export type FormattedTransaction = {
  id: string;
  type: string;
  amount: string;
  status: string;
  date: string;
  description: string;
};

export const LoginSchema = z.object({
  email: z.string().email({ message: "Please enter a valid email." }),
  password: z.string().min(1, { message: "Password is required." }),
});

export const RegisterSchema = z.object({
  email: z.string().email({
    message: "Email is required.",
  }),
  password: z.string().min(6, {
    message: "Minimum 6 characters required.",
  }),
  name: z.string().min(1, {
    message: "Name is required.",
  }),
});
