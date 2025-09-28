'use client';

import { useActionState } from 'react';
import { useFormStatus } from 'react-dom';
import { register } from '@/actions/user';
import {
  CardContent,
  CardFooter,
} from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '../ui/alert';
import { AlertCircle } from 'lucide-react';
import { redirect } from 'next/navigation';
import { useEffect } from 'react';

export function RegisterForm() {
  const [errorMessage, dispatch] = useActionState(register, undefined);

  useEffect(() => {
    if (errorMessage === "Success") {
      redirect('/dashboard');
    }
  }, [errorMessage]);

  return (
    <form action={dispatch}>
        <CardContent className="grid gap-4">
          <div className="grid gap-2">
            <Label htmlFor="name">Full Name</Label>
            <Input id="name" name="name" placeholder="John Doe" required />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              name="email"
              type="email"
              placeholder="m@example.com"
              required
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="password">Password</Label>
            <Input id="password" name="password" type="password" required />
          </div>
           {errorMessage && errorMessage !== "Success" && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{errorMessage}</AlertDescription>
            </Alert>
          )}
        </CardContent>
        <CardFooter className="flex flex-col gap-4">
          <RegisterButton />
        </CardFooter>
    </form>
  );
}

function RegisterButton() {
  const { pending } = useFormStatus();
  return (
    <Button className="w-full" aria-disabled={pending}>
      {pending ? 'Creating account...' : 'Create account'}
    </Button>
  );
}
