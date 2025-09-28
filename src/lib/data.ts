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
      currency: 'USD',
    };
  }

  // In a real app, you'd fetch the user, but we'll return a mock user.
  // The registration will create a user, but for data fetching, we will rely on mock data for now.
  return {
    id: 'mock-user-id',
    name: 'Guest User',
    email: 'guest@example.com',
    balance: 10000,
    accountNo: '1234567890',
    currency: 'USD',
  };
}

export async function getAccountSummary() {
  noStore();
  const userId = await getUserId();
  if (!userId) return { totalIncome: 0, totalExpenses: 0 };

  // Mock data to avoid database call
  return { totalIncome: 500, totalExpenses: 150 };
}


const ITEMS_PER_PAGE = 10;
export async function getFilteredTransactions(query: string, currentPage: number) {
  noStore();
  const userId = await getUserId();
  if (!userId) return { transactions: [], totalPages: 0 };

  // Mock data to avoid database call
  const mockTransactions = [
      { id: '1', type: 'deposit', amount: 500, status: 'completed', createdAt: new Date(), description: 'Paycheck', userId: 'mock-user-id' },
      { id: '2', type: 'transfer', amount: -50, status: 'completed', createdAt: new Date(), description: 'Dinner', userId: 'mock-user-id' },
      { id: '3', type: 'withdrawal', amount: -100, status: 'completed', createdAt: new Date(), description: 'ATM', userId: 'mock-user-id' },
  ];
  
  return { transactions: mockTransactions, totalPages: 1 };
}

export async function getRecentTransactions(limit = 5) {
  noStore();
  const userId = await getUserId();
  if (!userId) return [];

  // Mock data to avoid database call
  return [
      { id: '1', type: 'deposit', amount: 500, status: 'completed', createdAt: new Date(), description: 'Paycheck', userId: 'mock-user-id' },
      { id: '2', type: 'transfer', amount: -50, status: 'completed', createdAt: new Date(), description: 'Dinner', userId: 'mock-user-id' },
      { id: '3', type: 'withdrawal', amount: -100, status: 'completed', createdAt: new Date(), description: 'ATM', userId: 'mock-user-id' },
      { id: '4', type: 'transfer', amount: 20, status: 'completed', createdAt: new Date(), description: 'Friend payment', userId: 'mock-user-id' },
  ].slice(0, limit);
}
