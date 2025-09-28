import { getPendingDeposits, getUserData } from "@/lib/data";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { redirect } from "next/navigation";
import { PendingDepositsTable } from "@/components/admin/pending-deposits-table";
import { formatCurrency } from "@/lib/utils";

export default async function AdminPage() {
    const user = await getUserData();
    if (!user?.isAdmin) {
        redirect('/dashboard');
    }
    
    const pendingDeposits = await getPendingDeposits();
    const currency = user.currency;

    const formattedDeposits = pendingDeposits.map(d => ({
        ...d,
        amount: formatCurrency(d.amount, currency),
        createdAt: d.createdAt.toLocaleDateString(),
    }))

    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Admin Panel</h1>
                <p className="text-muted-foreground">Review and approve pending deposits.</p>
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
        </div>
    );
}
