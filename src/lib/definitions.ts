import { z } from 'zod';

export const LoginSchema = z.object({
  email: z.string().email({ message: "Please enter a valid email address." }),
  password: z.string().min(1, { message: "Password is required." }),
});

export const RegisterSchema = z.object({
  email: z.string().email({ message: "Please enter a valid email address." }),
  password: z.string().min(8, { message: "Password must be at least 8 characters long." }),
  name: z.string().min(2, { message: "Name must be at least 2 characters." }),
});

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

export const PasswordSchema = z.object({
  currentPassword: z.string().min(1, { message: "Current password is required." }),
  newPassword: z.string().min(8, { message: "New password must be at least 8 characters long." }),
  confirmPassword: z.string(),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "New passwords don't match.",
  path: ["confirmPassword"],
});

export type FormattedTransaction = {
  id: string;
  type: string;
  amount: string;
  status: string;
  date: string;
  description: string;
};
