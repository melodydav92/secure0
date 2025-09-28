import { TransferForm } from "@/components/transfer/transfer-form";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { getUserData } from "@/lib/data";

export default async function TransferPage() {
    const userData = await getUserData();

    return (
        <div className="mx-auto max-w-2xl space-y-8">
            <div className="text-center">
                <h1 className="text-3xl font-bold tracking-tight">Transfer Money</h1>
                <p className="text-muted-foreground">Send funds securely to any account.</p>
            </div>
            <Card>
                <CardHeader>
                    <CardTitle>New Transfer</CardTitle>
                    <CardDescription>
                        Your current balance is <span className="font-semibold text-primary">{new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(userData?.balance ?? 0)}</span>.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <TransferForm />
                </CardContent>
            </Card>
        </div>
    );
}
