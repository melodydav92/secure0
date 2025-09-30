import 'server-only';
import { unstable_noStore as noStore } from 'next/cache';

export async function getUserId() {
  noStore();
  // Mock user ID since auth is removed
  // In a real app, you'd get this from the session.
  // We can simulate different users by changing this value.
  // To view the admin page, you can temporarily set this to 'admin-user-id'
  return 'mock-user-id';
}

export async function getUserData() {
  noStore();
  
  const userId = await getUserId();

  if (userId === 'admin-user-id') {
     return {
      id: 'admin-user-id',
      name: 'Admin User',
      email: 'admin@example.com',
      balance: 99999, // This can be the main balance or removed if wallets are the source of truth
      accountNo: 'ADMIN00001',
      currency: 'USD',
      isAdmin: true,
    };
  }

  // In a real app, you'd fetch the user, but we'll return a mock user.
  return {
    id: 'mock-user-id',
    name: 'Guest User',
    email: 'guest@example.com',
    balance: 10000, // This is the primary USD balance.
    accountNo: '1234567890',
    currency: 'USD', // Primary currency
    isAdmin: false,
  };
}

// New function to get all wallets for the user
export async function getWallets() {
    noStore();
    const userId = await getUserId();
    if (!userId) return [];
    
    // Mock data for user's wallets. This would come from a database.
    return [
        { currency: 'USD', balance: 10000 },
        { currency: 'EUR', balance: 500 },
        { currency: 'GBP', balance: 250 },
    ];
}


export async function getAccountSummary() {
  noStore();
  const userId = await getUserId();
  if (!userId) return { totalIncome: 0, totalExpenses: 0 };

  // Mock data to avoid database call
  return { totalIncome: 500, totalExpenses: 150 };
}

export async function getOtherUsers() {
  noStore();
  const currentUserId = await getUserId();
  
  // Mock data for other users
  const allUsers = [
    { id: 'user-2', name: 'Jane Doe', accountNo: '1122334455' },
    { id: 'user-3', name: 'Peter Jones', accountNo: '6677889900' },
    { id: 'admin-user-id', name: 'Admin User', accountNo: 'ADMIN00001' },
    { id: 'mock-user-id', name: 'Guest User', accountNo: '1234567890' }, // Current user
  ];

  return allUsers.filter(user => user.id !== currentUserId);
}


const ITEMS_PER_PAGE = 10;
export async function getFilteredTransactions(query: string, currentPage: number) {
  noStore();
  const userId = await getUserId();
  if (!userId) return { transactions: [], totalPages: 0 };

  // Mock data to avoid database call
  const mockTransactions = [
      { id: '1', type: 'deposit', amount: 500, status: 'completed', createdAt: new Date(), description: 'Paycheck', userId: 'mock-user-id', proofOfPayment: null, senderId: null, receiverId: null },
      { id: '2', type: 'transfer', amount: -50, status: 'completed', createdAt: new Date(), description: 'Dinner', userId: 'mock-user-id', proofOfPayment: null, senderId: null, receiverId: null },
      { id: '3', type: 'withdrawal', amount: -100, status: 'completed', createdAt: new Date(), description: 'ATM', userId: 'mock-user-id', proofOfPayment: null, senderId: null, receiverId: null },
  ];
  
  return { transactions: mockTransactions, totalPages: 1 };
}

export async function getRecentTransactions(limit = 5) {
  noStore();
  const userId = await getUserId();
  if (!userId) return [];

  // Mock data to avoid database call
  return [
      { id: '1', type: 'deposit', amount: 500, status: 'completed', createdAt: new Date(), description: 'Paycheck', userId: 'mock-user-id', proofOfPayment: null, senderId: null, receiverId: null },
      { id: '2', type: 'transfer', amount: -50, status: 'completed', createdAt: new Date(), description: 'Dinner', userId: 'mock-user-id', proofOfPayment: null, senderId: null, receiverId: null },
      { id: '3', type: 'withdrawal', amount: -100, status: 'completed', createdAt: new Date(), description: 'ATM', userId: 'mock-user-id', proofOfPayment: null, senderId: null, receiverId: null },
      { id: '4', type: 'transfer', amount: 20, status: 'completed', createdAt: new Date(), description: 'Friend payment', userId: 'mock-user-id', proofOfPayment: null, senderId: null, receiverId: null },
  ].slice(0, limit);
}

export async function getPendingDeposits() {
    noStore();
    const user = await getUserData();
    if (!user?.isAdmin) {
        return [];
    }
    // Mock pending deposit
    return [
        { id: 'pending-1', type: 'deposit', amount: 250, status: 'pending', createdAt: new Date(), description: 'Manual Deposit', userId: 'mock-user-id', proofOfPayment: 'https://picsum.photos/seed/slip1/400/600', senderId: null, receiverId: null },
    ];
}

export async function getPendingWithdrawals() {
    noStore();
    const user = await getUserData();
    if (!user?.isAdmin) {
        return [];
    }
    // Mock pending withdrawals
    return [
        { id: 'pending-w-1', type: 'withdrawal', amount: -150, status: 'pending', createdAt: new Date(), description: 'Withdrawal Request', userId: 'mock-user-id', proofOfPayment: null, senderId: null, receiverId: null },
    ];
}
