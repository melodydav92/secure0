import 'server-only';
import prisma from '@/lib/prisma';
import { unstable_noStore as noStore } from 'next/cache';

// In a real app, you would have a way to identify the current user.
// For now, we'll hardcode a user ID.
const MOCK_USER_ID = 'clx1234567890abcdefgh'; 

export async function getUserData() {
  noStore();
  
  try {
    const user = await prisma.user.findUnique({
      where: { id: MOCK_USER_ID },
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

  try {
    const transactions = await prisma.transaction.findMany({
      where: { userId: MOCK_USER_ID, status: 'completed' },
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

  try {
    const transactions = await prisma.transaction.findMany({
      where: {
        userId: MOCK_USER_ID,
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
          userId: MOCK_USER_ID,
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

  try {
    const transactions = await prisma.transaction.findMany({
      where: { userId: MOCK_USER_ID },
      orderBy: { createdAt: 'desc' },
      take: limit,
    });
    return transactions;
  } catch (error) {
    console.error('Database Error:', error);
    return [];
  }
}
