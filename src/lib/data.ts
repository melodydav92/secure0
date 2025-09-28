import 'server-only';
import prisma from '@/lib/prisma';
import { unstable_noStore as noStore } from 'next/cache';
import { auth } from '@/auth';

export async function getUserId() {
  noStore();
  const session = await auth();
  return session?.user?.id;
}


export async function getUserData() {
  noStore();
  
  const userId = await getUserId();
  if (!userId) return null;

  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        email: true,
        balance: true,
        accountNo: true,
      },
    });
    return user;

  } catch (error) {
    console.error('Database Error:', error);
    throw new Error('Failed to fetch user data.');
  }
}

export async function getAccountSummary() {
  noStore();
  const userId = await getUserId();
  if (!userId) return { totalIncome: 0, totalExpenses: 0 };


  try {
    const transactions = await prisma.transaction.findMany({
      where: { userId: userId, status: 'completed' },
      select: { amount: true, type: true },
    });

    const totalIncome = transactions
      .filter(t => t.type === 'deposit' || (t.type === 'transfer' && t.amount > 0))
      .reduce((sum, t) => sum + t.amount, 0);

    const totalExpenses = transactions
      .filter(t => t.type === 'withdrawal' || (t.type === 'transfer' && t.amount < 0))
      .reduce((sum, t) => sum + Math.abs(t.amount), 0);
      
    return { totalIncome, totalExpenses };
  } catch (error) {
    console.error('Database Error:', error);
    throw new Error('Failed to fetch account summary.');
  }
}


const ITEMS_PER_PAGE = 10;
export async function getFilteredTransactions(query: string, currentPage: number) {
  noStore();
  const offset = (currentPage - 1) * ITEMS_PER_PAGE;
  const userId = await getUserId();
  if (!userId) return { transactions: [], totalPages: 0 };

  try {
    const transactions = await prisma.transaction.findMany({
      where: {
        userId: userId,
        ...(query && {
          OR: [
            { description: { contains: query, mode: 'insensitive' } },
            { type: { contains: query, mode: 'insensitive' } },
          ],
        }),
      },
      orderBy: { createdAt: 'desc' },
      take: ITEMS_PER_PAGE,
      skip: offset,
    });

    const totalPages = Math.ceil(
      await prisma.transaction.count({
        where: {
          userId: userId,
          ...(query && {
            OR: [
              { description: { contains: query, mode: 'insensitive' } },
              { type: { contains: query, mode: 'insensitive' } },
            ],
          }),
        },
      }) / ITEMS_PER_PAGE
    );

    return { transactions, totalPages };
  } catch (error) {
    console.error('Database Error:', error);
    throw new Error('Failed to fetch transactions.');
  }
}

export async function getRecentTransactions(limit = 5) {
  noStore();
  const userId = await getUserId();
  if (!userId) return [];


  try {
    const transactions = await prisma.transaction.findMany({
      where: { userId: userId },
      orderBy: { createdAt: 'desc' },
      take: limit,
    });
    return transactions;
  } catch (error) {
    console.error('Database Error:', error);
    return [];
  }
}