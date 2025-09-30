import { TransferForm } from "@/components/transfer/transfer-form";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { getUserData, getWallets } from "@/lib/data";
import { formatCurrency } from "@/lib/utils";

export default async function TransferPage() {
    const userData = await getUserData();
    const wallets = await getWallets();

    // For the description, we'll just show the primary wallet's balance.
    const primaryWallet = wallets.find(w => w.currency === userData.currency);

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
                        Your primary balance is <span className="font-semibold text-primary">{formatCurrency(primaryWallet?.balance ?? 0, userData.currency)}</span>.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <TransferForm wallets={wallets} />
                </CardContent>
            </Card>
        </div>
    );
}
