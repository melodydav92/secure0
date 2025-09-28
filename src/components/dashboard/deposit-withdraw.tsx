'use client';

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { Button } from "../ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger, DialogClose } from "../ui/dialog";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { createDeposit, createWithdrawal } from "@/actions/transaction";
import { useEffect, useRef, useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { Alert, AlertDescription, AlertTitle } from "../ui/alert";
import { AlertCircle, FileUp } from "lucide-react";
import Link from "next/link";
import { Card, CardContent } from "../ui/card";

function SubmitButton({ children }: { children: React.ReactNode }) {
    const { pending } = useFormStatus();
    return <Button type="submit" aria-disabled={pending} className="w-full">{pending ? 'Processing...' : children}</Button>
}

type DepositWithdrawProps = {
    isAdmin?: boolean;
}

export function DepositWithdraw({ isAdmin }: DepositWithdrawProps) {
    const { toast } = useToast();
    const [depositState, depositAction] = useActionState(createDeposit, { message: '', success: false });
    const [withdrawalState, withdrawalAction] = useActionState(createWithdrawal, { message: '', success: false });

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
            {isAdmin && <Button asChild><Link href="/admin">Admin Panel</Link></Button>}
            <Dialog open={isDepositOpen} onOpenChange={setDepositOpen}>
                <DialogTrigger asChild>
                    <Button>Deposit</Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle>Manual Bank Deposit</DialogTitle>
                        <DialogDescription>Transfer funds to the details below and upload proof.</DialogDescription>
                    </DialogHeader>
                    <Card>
                        <CardContent className="pt-6 text-sm space-y-2">
                           <p><strong>Bank:</strong> SecureBank PLC</p>
                           <p><strong>Account Number:</strong> 1234567890</p>
                           <p><strong>Account Name:</strong> SecureBank Deposits</p>
                        </CardContent>
                    </Card>
                    <form action={depositAction} ref={depositFormRef} className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="amount">Amount</Label>
                            <Input id="amount" name="amount" type="number" step="0.01" placeholder="0.00" required />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="proofOfPayment">Proof of Payment</Label>
                            <Input id="proofOfPayment" name="proofOfPayment" type="file" required className="pt-2 text-sm"/>
                        </div>
                        {!depositState.success && depositState.message && (
                            <Alert variant="destructive">
                                <AlertCircle className="h-4 w-4" />
                                <AlertDescription>{depositState.message}</AlertDescription>
                            </Alert>
                        )}
                        <DialogFooter className="sm:justify-start">
                             <SubmitButton>
                                <FileUp className="mr-2 h-4 w-4" />
                                Submit for Review
                             </SubmitButton>
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
