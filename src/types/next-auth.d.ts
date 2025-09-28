import type { DefaultSession } from 'next-auth';

declare module 'next-auth' {
  interface Session {
    user: {
      id: string;
      accountNo: string;
    } & DefaultSession['user'];
  }

  interface User {
      accountNo?: string;
  }
}
