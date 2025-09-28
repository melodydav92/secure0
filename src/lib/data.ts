import 'server-only';
import prisma from '@/lib/prisma';
import { unstable_noStore as noStore } from 'next/cache';

export async function getUserId() {
  noStore();
  // Mock user ID since auth is removed
  return 'mock-user-id';
}


export async function getUserData() {
  noStore();
  
  const userId = await getUserId();
  if (!userId) {
    // Return mock data if no user is logged in
    return {
      id: 'mock-user-id',
      name: 'Guest User',
      email: 'guest@example.com',
      balance: 10000,
      accountNo: '1234567890',
    };
  }

  try {
    // In a real app, you'd fetch the user, but we'll return a mock user.
    // The registration will create a user, but for data fetching, we will rely on mock data for now.
    const user = await prisma.user.findFirst();
    if (!user) {
         return {
          id: 'mock-user-id',
          name: 'Guest User',
          email: 'guest@example.com',
          balance: 10000,
          accountNo: '1234567890',
        };
    }
     return {
      id: user.id,
      name: user.name,
      email: user.email,
      balance: user.balance,
      accountNo: user.accountNo,
    };

  } catch (error) {
    console.error('Database Error:', error);
    // Return mock data on error
     return {
      id: 'mock-user-id',
      name: 'Guest User',
      email: 'guest@example.com',
      balance: 10000,
      accountNo: '1234567890',
    };
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
    return { totalIncome: 0, totalExpenses: 0 };
  }
}


const ITEMS_PER_PAGE = 10;
export async function getFilteredTransactions(query: string, currentPage: number) {
  noStore();
  const offset = (currentPage - 1) * ITEMS_PER_PAGE;
  const userId = await getUserId();
  if (!userId) return { transactions: [], totalPages: 0 };

  try {
    const whereClause: any = {
      ...(query && {
        OR: [
          { description: { contains: query, mode: 'insensitive' } },
          { type: { contains: query, mode: 'insensitive' } },
        ],
      }),
    };
    const user = await prisma.user.findFirst();
    if(user) {
      whereClause.userId = user.id;
    }


    const transactions = await prisma.transaction.findMany({
      where: whereClause,
      orderBy: { createdAt: 'desc' },
      take: ITEMS_PER_PAGE,
      skip: offset,
    });

    const totalCount = await prisma.transaction.count({ where: whereClause });
    const totalPages = Math.ceil(totalCount / ITEMS_PER_PAGE);

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
    const user = await prisma.user.findFirst();
    if (!user) return [];
    const transactions = await prisma.transaction.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: 'desc' },
      take: limit,
    });
    return transactions;
  } catch (error) {
    console.error('Database Error:', error);
    return [];
  }
}
