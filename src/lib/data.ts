import 'server-only';
import prisma from '@/lib/prisma';
import { auth } from '@/auth';
import { unstable_noStore as noStore } from 'next/cache';

export async function getUserData() {
  noStore();
  const session = await auth();
  if (!session?.user?.id) return null;

  try {
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: {
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
  const session = await auth();
  if (!session?.user?.id) return null;

  try {
    const transactions = await prisma.transaction.findMany({
      where: { userId: session.user.id, status: 'completed' },
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
  const session = await auth();
  if (!session?.user?.id) throw new Error('User not authenticated');
  const offset = (currentPage - 1) * ITEMS_PER_PAGE;

  try {
    const transactions = await prisma.transaction.findMany({
      where: {
        userId: session.user.id,
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
          userId: session.user.id,
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
  const session = await auth();
  if (!session?.user?.id) return [];

  try {
    const transactions = await prisma.transaction.findMany({
      where: { userId: session.user.id },
      orderBy: { createdAt: 'desc' },
      take: limit,
    });
    return transactions;
  } catch (error) {
    console.error('Database Error:', error);
    return [];
  }
}
