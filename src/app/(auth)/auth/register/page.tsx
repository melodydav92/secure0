import { RegisterForm } from "@/components/auth/register-form";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import Link from "next/link";

export default function RegisterPage() {
    return (
        <Card>
            <CardHeader>
                <CardTitle>Create an Account</CardTitle>
                <CardDescription>Join SecureBank today. It&apos;s fast and easy.</CardDescription>
            </CardHeader>
            <CardContent>
                <RegisterForm />
            </CardContent>
            <CardFooter className="flex justify-center">
                <p className="text-sm text-muted-foreground">
                    Already have an account?{' '}
                    <Link href="/auth/login" className="font-medium text-primary hover:underline">
                        Login
                    </Link>
                </p>
            </CardFooter>
        </Card>
    );
}
