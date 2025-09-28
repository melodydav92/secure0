import { Button } from '@/components/ui/button';
import { Banknote } from 'lucide-react';
import Link from 'next/link';

export default function Home() {
  return (
    <main className="flex h-screen flex-col items-center justify-center bg-background p-8">
      <div className="text-center">
        <div className="mb-4 flex items-center justify-center">
          <Banknote className="h-16 w-16 text-primary" />
        </div>
        <h1 className="text-5xl font-bold text-primary">SecureBank</h1>
        <p className="mt-4 text-lg text-muted-foreground">
          Your trusted partner in modern digital banking.
        </p>
      </div>
      <div className="mt-10 flex gap-4">
        <Button asChild size="lg">
          <Link href="/dashboard">Go to Dashboard</Link>
        </Button>
      </div>
    </main>
  );
}
