'use server';

import { z } from 'zod';
import { revalidatePath } from 'next/cache';
import { DepositWithdrawSchema } from '@/lib/definitions';
import { detectFraud } from '@/ai/flows/fraud-detection';
import { getUserId, getUserData, getWallets } from '@/lib/data';

export type FormState = {
  message: string;
  success: boolean;
};

// Update TransferSchema to include fromAccount
const TransferSchema = z.object({
  fromAccount: z.string().min(1, "Source account is required."),
  recipientAccountNo: z.string().min(1, "Recipient account number is required."),
  amount: z.coerce.number().positive({ message: "Amount must be greater than 0." }),
  description: z.string().optional(),
});


async function checkFraud(amount: number, description: string | undefined | null) {
    const userId = await getUserId();
    if (!userId) {
        throw new Error("User not authenticated");
    }

    const transactionHistory: any[] = []; // Mock transaction history

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
    
    const fraudResult = await detectFraud({ transactionHistory, currentTransaction });
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

  const { amount } = validatedFields.data;

  try {
    // Mock creating a pending deposit
    console.log(`Deposit of ${amount} for user ${userId} submitted for review.`);
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
        const user = await getUserData();
        if (!user || user.balance < amount) {
            throw new Error('Insufficient funds for withdrawal request.');
        }
        // Mock creating a pending withdrawal
        console.log(`Withdrawal request for ${amount} from user ${userId} submitted for review.`);
        revalidatePath('/dashboard');
        revalidatePath('/transactions');
        return { message: `Withdrawal request for ${amount.toFixed(2)} submitted for review.`, success: true };
    } catch (error: any) {
        return { message: error.message || 'Withdrawal request failed.', success: false };
    }
}

export async function createTransfer(prevState: FormState, formData: FormData) {
  const validatedFields = TransferSchema.safeParse({
    fromAccount: formData.get('fromAccount'),
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

  const { fromAccount, recipientAccountNo, amount, description } = validatedFields.data;

  // Mock recipient check
  if (recipientAccountNo === '0000000000') {
      return { message: 'Recipient account not found.', success: false };
  }
  
  const sender = await getUserData();

  if (recipientAccountNo === sender?.accountNo) {
    return { message: 'Cannot transfer money to your own account.', success: false };
  }
  
  const wallets = await getWallets();
  const sourceWallet = wallets.find(w => w.currency === fromAccount);

  if (!sourceWallet) {
      return { message: 'Invalid source wallet.', success: false };
  }

  try {
    const fraudResult = await checkFraud(amount, description);
    if (fraudResult.isFraudulent) {
        console.log(`Flagged fraudulent transaction for user ${senderId}. Reason: ${fraudResult.fraudExplanation}`);
        revalidatePath('/dashboard');
        revalidatePath('/transactions');
        return { message: `Fraud Alert: ${fraudResult.fraudExplanation}`, success: false };
    }

    if (sourceWallet.balance < amount) {
        throw new Error('Insufficient funds.');
    }
    
    // Mock transfer logic
    console.log(`Transfer of ${amount} ${fromAccount} from ${senderId} to ${recipientAccountNo} successful.`);

    revalidatePath('/dashboard');
    revalidatePath('/transfer');
    revalidatePath('/transactions');
    revalidatePath('/convert');
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
       // Mock deposit confirmation
       console.log(`Admin ${user.id} confirmed deposit ${transactionId}`);

        revalidatePath('/admin');
        revalidatePath('/dashboard');
        revalidatePath('/transactions');
        revalidatePath('/convert');

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
        // Mock withdrawal confirmation
        console.log(`Admin ${adminUser.id} confirmed withdrawal ${transactionId}`);

        revalidatePath('/admin');
        revalidatePath('/dashboard');
        revalidatePath('/transactions');
        revalidatePath('/convert');

        return { message: "Withdrawal confirmed successfully!", success: true };
    } catch (error: any) {
        return { message: error.message || "Failed to confirm withdrawal.", success: false };
    }
}
