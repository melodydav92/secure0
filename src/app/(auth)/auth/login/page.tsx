import { LoginForm } from "@/components/auth/login-form";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import Link from "next/link";

export default function LoginPage() {
    return (
        <Card>
            <CardHeader>
                <CardTitle>Welcome Back!</CardTitle>
                <CardDescription>Enter your credentials to access your account.</CardDescription>
            </CardHeader>
            <CardContent>
                <LoginForm />
            </CardContent>
            <CardFooter className="flex justify-center">
                <p className="text-sm text-muted-foreground">
                    Don&apos;t have an account?{' '}
                    <Link href="/auth/register" className="font-medium text-primary hover:underline">
                        Sign up
                    </Link>
                </p>
            </CardFooter>
        </Card>
    );
}
