'use client';

import { useFormState, useFormStatus } from 'react-dom';
import { authenticate } from '@/actions/auth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '../ui/alert';
import { AlertCircle } from 'lucide-react';

function LoginButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" className="w-full" aria-disabled={pending}>
      {pending ? 'Logging in...' : 'Login'}
    </Button>
  );
}

export function LoginForm() {
  const [errorMessage, dispatch] = useFormState(authenticate, undefined);

  return (
    <form action={dispatch} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          name="email"
          type="email"
          placeholder="m@example.com"
          required
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="password">Password</Label>
        <Input id="password" name="password" type="password" required />
      </div>
      {errorMessage && (
        <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
                {errorMessage}
            </AlertDescription>
        </Alert>
      )}
      <LoginButton />
    </form>
  );
}
