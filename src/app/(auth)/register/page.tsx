import { RegisterForm } from "@/components/auth/register-form";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function RegisterPage() {
  return (
    <div className="mx-auto max-w-md space-y-8">
      <Card>
          <CardHeader>
              <CardTitle>Register</CardTitle>
              <CardDescription>Create a new account.</CardDescription>
          </CardHeader>
          <CardContent>
              <RegisterForm />
          </CardContent>
      </Card>
    </div>
  );
}
