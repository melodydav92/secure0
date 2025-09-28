'use server';

import { z } from 'zod';
import prisma from '@/lib/prisma';
import { revalidatePath } from 'next/cache';
import { DepositWithdrawSchema, TransferSchema } from '@/lib/definitions';
import { detectFraud } from '@/ai/flows/fraud-detection';
import { getUserId, getUserData } from '@/lib/data';

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

const DepositSchema = z.object({
  amount: z.coerce.number().positive({ message: "Amount must be greater than 0." }),
  proofOfPayment: z.any()
});

export async function createDeposit(prevState: FormState, formData: FormData) {
  const validatedFields = DepositSchema.safeParse({
    amount: formData.get('amount'),
    proofOfPayment: formData.get('proofOfPayment')
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

  const { amount, proofOfPayment } = validatedFields.data;

  // In a real app, you would upload the file to a storage service (e.g., Firebase Storage)
  // and get a URL. For now, we'll use a placeholder.
  const proofOfPaymentUrl = 'https://picsum.photos/seed/slip-proof/400/600';

  try {
    await prisma.transaction.create({
      data: {
        userId: userId,
        type: 'deposit',
        amount: amount,
        description: 'Manual Deposit',
        status: 'pending',
        proofOfPayment: proofOfPaymentUrl,
      },
    });
    revalidatePath('/dashboard');
    revalidatePath('/transactions');
    return { message: `Deposit of ${amount.toFixed(2)} submitted for review. It will reflect in your balance upon approval.`, success: true };
  } catch (error) {
    return { message: 'Deposit submission failed.', success: false };
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
                throw new Error('Insufficient funds for withdrawal request.');
            }
             await tx.transaction.create({
                data: {
                    userId: userId,
                    type: 'withdrawal',
                    amount: -amount,
                    description: 'Withdrawal Request',
                    status: 'pending',
                },
            });
        });
        revalidatePath('/dashboard');
        revalidatePath('/transactions');
        return { message: `Withdrawal request for ${amount.toFixed(2)} submitted for review.`, success: true };
    } catch (error: any) {
        return { message: error.message || 'Withdrawal request failed.', success: false };
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

export async function confirmDeposit(transactionId: string) {
    const user = await getUserData();
    if (!user?.isAdmin) {
        return { message: "Unauthorized", success: false };
    }

    try {
        const transaction = await prisma.transaction.findUnique({
            where: { id: transactionId }
        });

        if (!transaction || transaction.status !== 'pending' || transaction.type !== 'deposit') {
            return { message: "Invalid transaction or transaction not pending.", success: false };
        }

        await prisma.$transaction(async (tx) => {
            // Update user's balance
            await tx.user.update({
                where: { id: transaction.userId },
                data: { balance: { increment: transaction.amount } }
            });

            // Update transaction status
            await tx.transaction.update({
                where: { id: transactionId },
                data: { status: 'completed' }
            });
        });

        revalidatePath('/admin');
        revalidatePath('/dashboard');
        revalidatePath('/transactions');

        return { message: "Deposit confirmed successfully!", success: true };
    } catch (error: any) {
        return { message: error.message || "Failed to confirm deposit.", success: false };
    }
}

export async function confirmWithdrawal(transactionId: string) {
    const adminUser = await getUserData();
    if (!adminUser?.isAdmin) {
        return { message: "Unauthorized", success: false };
    }

    try {
        const transaction = await prisma.transaction.findUnique({
            where: { id: transactionId }
        });

        if (!transaction || transaction.status !== 'pending' || transaction.type !== 'withdrawal') {
            return { message: "Invalid transaction or not a pending withdrawal.", success: false };
        }
        
        // Amount is negative for withdrawal, so we use it directly
        const withdrawalAmount = transaction.amount; 

        await prisma.$transaction(async (tx) => {
             const user = await tx.user.findUnique({ where: { id: transaction.userId } });
             if (!user || user.balance < Math.abs(withdrawalAmount)) {
                // Update transaction status to 'failed' if insufficient funds
                await tx.transaction.update({
                    where: { id: transactionId },
                    data: { status: 'failed', description: 'Withdrawal Failed: Insufficient funds' }
                });
                throw new Error('Insufficient funds for withdrawal.');
            }

            // Update user's balance
            await tx.user.update({
                where: { id: transaction.userId },
                data: { balance: { increment: withdrawalAmount } } // increment because amount is negative
            });

            // Update transaction status
            await tx.transaction.update({
                where: { id: transactionId },
                data: { status: 'completed' }
            });
        });

        revalidatePath('/admin');
        revalidatePath('/dashboard');
        revalidatePath('/transactions');

        return { message: "Withdrawal confirmed successfully!", success: true };
    } catch (error: any) {
        return { message: error.message || "Failed to confirm withdrawal.", success: false };
    }
}
