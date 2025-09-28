'use server';

import { z } from 'zod';
import prisma from '@/lib/prisma';
import { revalidatePath } from 'next/cache';
import { DepositWithdrawSchema, TransferSchema } from '@/lib/definitions';
import { detectFraud } from '@/ai/flows/fraud-detection';
import { getUserId } from '@/lib/data';

export type FormState = {
  message: string;
  success: boolean;
};

async function checkFraud(amount: number, description: string | undefined | null) {
  const userId = await getUserId();
  if (!userId) {
      throw new Error("User not authenticated");
  }

  const transactionHistory = await prisma.transaction.findMany({
    where: { userId },
    orderBy: { createdAt: 'desc' },
    take: 20,
    select: {
      id: true,
      type: true,
      amount: true,
      description: true,
      senderId: true,
      receiverId: true,
      userId: true,
      createdAt: true,
    }
  });

  // Prisma returns Date objects, but Genkit schema expects strings.
  const historyForAI = transactionHistory.map(t => ({
      ...t,
      createdAt: t.createdAt.toISOString()
  }));

  const currentTransaction = {
      id: "temp-" + Date.now(),
      type: 'transfer',
      amount: amount,
      description: description || "Transfer",
      senderId: userId,
      receiverId: 'unknown',
      userId: userId,
      createdAt: new Date().toISOString()
  };
  
  const fraudResult = await detectFraud({ transactionHistory: historyForAI, currentTransaction });
  return fraudResult;
}


export async function createDeposit(prevState: FormState, formData: FormData) {
  const validatedFields = DepositWithdrawSchema.safeParse({
    amount: formData.get('amount'),
  });
  
  const userId = await getUserId();
  if (!userId) {
      return { message: 'Authentication required.', success: false };
  }


  if (!validatedFields.success) {
    return {
      message: validatedFields.error.flatten().fieldErrors.amount?.[0] ?? 'Invalid input.',
      success: false,
    };
  }

  const { amount } = validatedFields.data;

  try {
    await prisma.$transaction(async (tx) => {
      await tx.user.update({
        where: { id: userId },
        data: { balance: { increment: amount } },
      });
      await tx.transaction.create({
        data: {
          userId: userId,
          type: 'deposit',
          amount: amount,
          description: 'Cash Deposit',
          status: 'completed',
        },
      });
    });
    revalidatePath('/dashboard');
    return { message: `Successfully deposited ${amount.toFixed(2)}.`, success: true };
  } catch (error) {
    return { message: 'Deposit failed.', success: false };
  }
}

export async function createWithdrawal(prevState: FormState, formData: FormData) {
    const validatedFields = DepositWithdrawSchema.safeParse({
        amount: formData.get('amount'),
    });

    const userId = await getUserId();
    if (!userId) {
        return { message: 'Authentication required.', success: false };
    }

    if (!validatedFields.success) {
        return {
            message: validatedFields.error.flatten().fieldErrors.amount?.[0] ?? 'Invalid input.',
            success: false,
        };
    }

    const { amount } = validatedFields.data;

    try {
        await prisma.$transaction(async (tx) => {
            const user = await tx.user.findUnique({ where: { id: userId } });
            if (!user || user.balance < amount) {
                throw new Error('Insufficient funds.');
            }
            await tx.user.update({
                where: { id: userId },
                data: { balance: { decrement: amount } },
            });
            await tx.transaction.create({
                data: {
                    userId: userId,
                    type: 'withdrawal',
                    amount: -amount,
                    description: 'Cash Withdrawal',
                    status: 'completed',
                },
            });
        });
        revalidatePath('/dashboard');
        return { message: `Successfully withdrew ${amount.toFixed(2)}.`, success: true };
    } catch (error: any) {
        return { message: error.message || 'Withdrawal failed.', success: false };
    }
}

export async function createTransfer(prevState: FormState, formData: FormData) {
  const validatedFields = TransferSchema.safeParse({
    recipientAccountNo: formData.get('recipientAccountNo'),
    amount: formData.get('amount'),
    description: formData.get('description'),
  });

  const senderId = await getUserId();
  if (!senderId) {
    return { message: 'Authentication required.', success: false };
  }

  if (!validatedFields.success) {
    return {
      message: Object.values(validatedFields.error.flatten().fieldErrors).flat()[0] || 'Invalid input.',
      success: false,
    };
  }

  const { recipientAccountNo, amount, description } = validatedFields.data;

  const recipient = await prisma.user.findUnique({
    where: { accountNo: recipientAccountNo },
  });

  if (!recipient) {
    return { message: 'Recipient account not found.', success: false };
  }

  if (recipient.id === senderId) {
    return { message: 'Cannot transfer money to your own account.', success: false };
  }

  try {
    const fraudResult = await checkFraud(amount, description);
    if (fraudResult.isFraudulent) {
        await prisma.transaction.create({
            data: {
                userId: senderId,
                type: 'transfer',
                amount: -amount,
                description: `Transfer to ${recipient.accountNo} (Flagged)`,
                status: 'flagged',
            },
        });
        revalidatePath('/dashboard');
        revalidatePath('/transactions');
        return { message: `Fraud Alert: ${fraudResult.fraudExplanation}`, success: false };
    }

    await prisma.$transaction(async (tx) => {
      const sender = await tx.user.findUnique({ where: { id: senderId } });
      if (!sender || sender.balance < amount) {
        throw new Error('Insufficient funds.');
      }

      // Debit from sender
      await tx.user.update({
        where: { id: senderId },
        data: { balance: { decrement: amount } },
      });
      await tx.transaction.create({
        data: {
          userId: senderId,
          type: 'transfer',
          amount: -amount,
          description: `Transfer to ${recipient.name} (${recipient.accountNo})`,
        },
      });

      // Credit to recipient
      await tx.user.update({
        where: { id: recipient.id },
        data: { balance: { increment: amount } },
      });
      await tx.transaction.create({
        data: {
          userId: recipient.id,
          type: 'transfer',
          amount: amount,
          description: `Transfer from ${sender.name}`,
        },
      });
    });

    revalidatePath('/dashboard');
    revalidatePath('/transfer');
    revalidatePath('/transactions');
    return { message: 'Transfer successful!', success: true };
  } catch (error: any) {
    return { message: error.message || 'Transfer failed.', success: false };
  }
}