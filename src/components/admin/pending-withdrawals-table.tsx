'use client';

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "../ui/button";
import { confirmWithdrawal } from "@/actions/transaction";
import { useTransition } from "react";
import { useToast } from "@/hooks/use-toast";

type FormattedWithdrawal = {
    id: string;
    amount: string;
    status: string;
    createdAt: string;
    userId: string;
}

type PendingWithdrawalsTableProps = {
    withdrawals: FormattedWithdrawal[];
}

export function PendingWithdrawalsTable({ withdrawals }: PendingWithdrawalsTableProps) {
  const [isPending, startTransition] = useTransition();
  const { toast } = useToast();
  
  const handleConfirm = (transactionId: string) => {
    startTransition(() => {
        confirmWithdrawal(transactionId).then(res => {
             toast({
                title: res.success ? 'Success' : 'Error',
                description: res.message,
                variant: res.success ? 'default' : 'destructive'
            });
        })
    });
  }

  if (withdrawals.length === 0) {
    return <p className="text-muted-foreground text-center">No pending withdrawals.</p>
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>User ID</TableHead>
          <TableHead>Date</TableHead>
          <TableHead>Status</TableHead>
          <TableHead className="text-right">Amount</TableHead>
          <TableHead className="text-right">Action</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {withdrawals.map((withdrawal) => (
          <TableRow key={withdrawal.id}>
            <TableCell className="font-medium">{withdrawal.userId}</TableCell>
            <TableCell>{withdrawal.createdAt}</TableCell>
            <TableCell>
                 <Badge variant="secondary" className="capitalize">{withdrawal.status}</Badge>
            </TableCell>
            <TableCell className="text-right font-semibold">{withdrawal.amount}</TableCell>
            <TableCell className="text-right">
                <Button 
                    size="sm" 
                    onClick={() => handleConfirm(withdrawal.id)}
                    disabled={isPending}
                >
                    {isPending ? 'Confirming...' : 'Confirm'}
                </Button>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
