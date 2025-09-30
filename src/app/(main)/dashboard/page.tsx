import { getAccountSummary, getRecentTransactions, getUserData } from "@/lib/data";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { DollarSign, TrendingUp, TrendingDown, Landmark } from "lucide-react";
import { RecentTransactions } from "@/components/dashboard/recent-transactions";
import { DepositWithdraw } from "@/components/dashboard/deposit-withdraw";
import { formatCurrency } from "@/lib/utils";

export default async function DashboardPage() {
    const userData = await getUserData();
    const accountSummary = await getAccountSummary();
    const recentTransactions = await getRecentTransactions(5);

    if (!userData) {
        return <div>Loading...</div>
    }

    return (
        <div className="space-y-8">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-2">
                <h1 className="text-3xl font-bold tracking-tight">
                    Welcome back, {userData?.name}!
                </h1>
                <div className="flex items-center gap-4">
                    <DepositWithdraw isAdmin={userData?.isAdmin} />
                </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">
                            Account Balance
                        </CardTitle>
                        <DollarSign className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{formatCurrency(userData?.balance ?? 0, userData.currency)}</div>
                        <p className="text-xs text-muted-foreground">
                            Account No: {userData?.accountNo}
                        </p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Income</CardTitle>
                        <TrendingUp className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-green-600">
                            {formatCurrency(accountSummary?.totalIncome ?? 0, userData.currency)}
                        </div>
                         <p className="text-xs text-muted-foreground">
                            This month
                        </p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Expenses</CardTitle>
                        <TrendingDown className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-red-600">
                            {formatCurrency(accountSummary?.totalExpenses ?? 0, userData.currency)}
                        </div>
                        <p className="text-xs text-muted-foreground">
                            This month
                        </p>
                    </CardContent>
                </Card>
                 <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Transactions</CardTitle>
                        <Landmark className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">
                            {(recentTransactions || []).length}
                        </div>
                        <p className="text-xs text-muted-foreground">
                            Last 5 transactions
                        </p>
                    </CardContent>
                </Card>
            </div>
            
            <Card>
                <CardHeader>
                    <CardTitle>Recent Transactions</CardTitle>
                    <CardDescription>A list of your most recent transactions.</CardDescription>
                </CardHeader>
                <CardContent>
                    <RecentTransactions transactions={recentTransactions || []} currency={userData.currency} />
                </CardContent>
            </Card>
        </div>
    )
}
