'use client';

import { useFormState, useFormStatus } from "react-dom";
import { Button } from "../ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger, DialogClose } from "../ui/dialog";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { createDeposit, createWithdrawal } from "@/actions/transaction";
import { useEffect, useRef, useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { Alert, AlertDescription } from "../ui/alert";
import { AlertCircle } from "lucide-react";

function SubmitButton({ children }: { children: React.ReactNode }) {
    const { pending } = useFormStatus();
    return <Button type="submit" aria-disabled={pending}>{pending ? 'Processing...' : children}</Button>
}

export function DepositWithdraw() {
    const { toast } = useToast();
    const [depositState, depositAction] = useFormState(createDeposit, { message: '', success: false });
    const [withdrawalState, withdrawalAction] = useFormState(createWithdrawal, { message: '', success: false });

    const [isDepositOpen, setDepositOpen] = useState(false);
    const [isWithdrawalOpen, setWithdrawalOpen] = useState(false);
    
    const depositFormRef = useRef<HTMLFormElement>(null);
    const withdrawalFormRef = useRef<HTMLFormElement>(null);

    useEffect(() => {
        if(depositState.message) {
            toast({
                title: depositState.success ? 'Success' : 'Error',
                description: depositState.message,
                variant: depositState.success ? 'default' : 'destructive'
            });
            if (depositState.success) {
                setDepositOpen(false);
                depositFormRef.current?.reset();
            }
        }
    }, [depositState, toast]);

    useEffect(() => {
        if(withdrawalState.message) {
            toast({
                title: withdrawalState.success ? 'Success' : 'Error',
                description: withdrawalState.message,
                variant: withdrawalState.success ? 'default' : 'destructive'
            });
            if (withdrawalState.success) {
                setWithdrawalOpen(false);
                withdrawalFormRef.current?.reset();
            }
        }
    }, [withdrawalState, toast]);
    
    return (
        <div className="flex items-center gap-4">
            <Dialog open={isDepositOpen} onOpenChange={setDepositOpen}>
                <DialogTrigger asChild>
                    <Button>Deposit</Button>
                </DialogTrigger>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Make a Deposit</DialogTitle>
                        <DialogDescription>Enter the amount you would like to deposit.</DialogDescription>
                    </DialogHeader>
                    <form action={depositAction} ref={depositFormRef} className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="amount">Amount</Label>
                            <Input id="amount" name="amount" type="number" step="0.01" placeholder="0.00" required />
                        </div>
                        {!depositState.success && depositState.message && (
                            <Alert variant="destructive">
                                <AlertCircle className="h-4 w-4" />
                                <AlertDescription>{depositState.message}</AlertDescription>
                            </Alert>
                        )}
                        <DialogFooter>
                            <DialogClose asChild><Button variant="ghost">Cancel</Button></DialogClose>
                            <SubmitButton>Deposit</SubmitButton>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>

            <Dialog open={isWithdrawalOpen} onOpenChange={setWithdrawalOpen}>
                <DialogTrigger asChild>
                    <Button variant="outline">Withdraw</Button>
                </DialogTrigger>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Make a Withdrawal</DialogTitle>
                        <DialogDescription>Enter the amount you would like to withdraw.</DialogDescription>
                    </DialogHeader>
                     <form action={withdrawalAction} ref={withdrawalFormRef} className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="amount">Amount</Label>
                            <Input id="amount" name="amount" type="number" step="0.01" placeholder="0.00" required />
                        </div>
                        {!withdrawalState.success && withdrawalState.message && (
                            <Alert variant="destructive">
                                <AlertCircle className="h-4 w-4" />
                                <AlertDescription>{withdrawalState.message}</AlertDescription>
                            </Alert>
                        )}
                        <DialogFooter>
                            <DialogClose asChild><Button variant="ghost">Cancel</Button></DialogClose>
                            <SubmitButton>Withdraw</SubmitButton>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>
        </div>
    );
}
