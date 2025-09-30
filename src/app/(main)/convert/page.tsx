import { ConvertForm } from "@/components/convert/convert-form";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { getUserData } from "@/lib/data";
import { formatCurrency } from "@/lib/utils";

export default async function ConvertPage() {
    const userData = await getUserData();

    if (!userData) {
        return <div>Loading...</div>
    }

    return (
        <div className="mx-auto max-w-2xl space-y-8">
            <div className="text-center">
                <h1 className="text-3xl font-bold tracking-tight">Convert Currency</h1>
                <p className="text-muted-foreground">Convert funds from your main balance.</p>
            </div>
            <Card>
                <CardHeader>
                    <CardTitle>New Conversion</CardTitle>
                    <CardDescription>
                        Your current balance is <span className="font-semibold text-primary">{formatCurrency(userData.balance, userData.currency)}</span>.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <ConvertForm 
                        currentBalance={userData.balance} 
                        currentCurrency={userData.currency} 
                    />
                </CardContent>
            </Card>
        </div>
    );
}
