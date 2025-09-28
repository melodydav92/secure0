import { getPendingDeposits, getPendingWithdrawals, getUserData } from "@/lib/data";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { redirect } from "next/navigation";
import { PendingDepositsTable } from "@/components/admin/pending-deposits-table";
import { formatCurrency } from "@/lib/utils";
import { PendingWithdrawalsTable } from "@/components/admin/pending-withdrawals-table";
import { Separator } from "@/components/ui/separator";

export default async function AdminPage() {
    const user = await getUserData();
    if (!user?.isAdmin) {
        redirect('/dashboard');
    }
    
    const pendingDeposits = await getPendingDeposits();
    const pendingWithdrawals = await getPendingWithdrawals();
    const currency = user.currency;

    const formattedDeposits = pendingDeposits.map(d => ({
        ...d,
        amount: formatCurrency(d.amount, currency),
        createdAt: d.createdAt.toLocaleDateString(),
    }))

     const formattedWithdrawals = pendingWithdrawals.map(w => ({
        ...w,
        amount: formatCurrency(w.amount, currency),
        createdAt: w.createdAt.toLocaleDateString(),
    }));

    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Admin Panel</h1>
                <p className="text-muted-foreground">Review and manage pending requests.</p>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Pending Deposits</CardTitle>
                    <CardDescription>The following deposits are awaiting approval.</CardDescription>
                </CardHeader>
                <CardContent>
                    <PendingDepositsTable deposits={formattedDeposits} />
                </CardContent>
            </Card>

            <Separator />

            <Card>
                <CardHeader>
                    <CardTitle>Pending Withdrawals</CardTitle>
                    <CardDescription>The following withdrawals are awaiting approval.</CardDescription>
                </CardHeader>
                <CardContent>
                   <PendingWithdrawalsTable withdrawals={formattedWithdrawals} />
                </CardContent>
            </Card>
        </div>
    );
}
