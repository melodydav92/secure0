'use client';

import { useFormState, useFormStatus } from "react-dom";
import { createTransfer } from "@/actions/transaction";
import { Button } from "../ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Textarea } from "../ui/textarea";
import { useEffect, useRef } from "react";
import { useToast } from "@/hooks/use-toast";
import { Alert, AlertDescription } from "../ui/alert";
import { AlertCircle } from "lucide-react";

function SubmitButton() {
    const { pending } = useFormStatus();
    return <Button type="submit" className="w-full" aria-disabled={pending}>{pending ? 'Sending...' : 'Send Money'}</Button>;
}

export function TransferForm() {
    const { toast } = useToast();
    const [state, dispatch] = useFormState(createTransfer, { message: '', success: false });
    const formRef = useRef<HTMLFormElement>(null);

    useEffect(() => {
        if (state.message) {
            toast({
                title: state.success ? 'Success' : 'Error',
                description: state.message,
                variant: state.success ? 'default' : 'destructive'
            });
            if (state.success) {
                formRef.current?.reset();
            }
        }
    }, [state, toast]);

    return (
        <form ref={formRef} action={dispatch} className="space-y-4">
            <div className="space-y-2">
                <Label htmlFor="recipientAccountNo">Recipient Account Number</Label>
                <Input id="recipientAccountNo" name="recipientAccountNo" placeholder="Enter account number" required />
            </div>
            <div className="space-y-2">
                <Label htmlFor="amount">Amount</Label>
                <Input id="amount" name="amount" type="number" step="0.01" placeholder="0.00" required />
            </div>
            <div className="space-y-2">
                <Label htmlFor="description">Description (Optional)</Label>
                <Textarea id="description" name="description" placeholder="e.g., For dinner" />
            </div>

            {!state.success && state.message && (
                <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>{state.message}</AlertDescription>
                </Alert>
            )}

            <SubmitButton />
        </form>
    );
}
