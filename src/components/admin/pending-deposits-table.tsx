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
import { confirmDeposit } from "@/actions/transaction";
import { useTransition } from "react";
import { useToast } from "@/hooks/use-toast";
import Link from "next/link";
import { ExternalLink } from "lucide-react";

type FormattedDeposit = {
    id: string;
    amount: string;
    status: string;
    createdAt: string;
    userId: string;
    proofOfPayment: string | null;
}

type PendingDepositsTableProps = {
    deposits: FormattedDeposit[];
}

export function PendingDepositsTable({ deposits }: PendingDepositsTableProps) {
  const [isPending, startTransition] = useTransition();
  const { toast } = useToast();
  
  const handleConfirm = (transactionId: string) => {
    startTransition(() => {
        confirmDeposit(transactionId).then(res => {
             toast({
                title: res.success ? 'Success' : 'Error',
                description: res.message,
                variant: res.success ? 'default' : 'destructive'
            });
        })
    });
  }

  if (deposits.length === 0) {
    return <p className="text-muted-foreground text-center">No pending deposits.</p>
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>User ID</TableHead>
          <TableHead>Date</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Proof</TableHead>
          <TableHead className="text-right">Amount</TableHead>
          <TableHead className="text-right">Action</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {deposits.map((deposit) => (
          <TableRow key={deposit.id}>
            <TableCell className="font-medium">{deposit.userId}</TableCell>
            <TableCell>{deposit.createdAt}</TableCell>
            <TableCell>
                 <Badge variant="secondary" className="capitalize">{deposit.status}</Badge>
            </TableCell>
            <TableCell>
                {deposit.proofOfPayment && (
                    <Button variant="ghost" size="sm" asChild>
                        <Link href={deposit.proofOfPayment} target="_blank">
                            View <ExternalLink className="h-4 w-4 ml-2" />
                        </Link>
                    </Button>
                )}
            </TableCell>
            <TableCell className="text-right font-semibold">{deposit.amount}</TableCell>
            <TableCell className="text-right">
                <Button 
                    size="sm" 
                    onClick={() => handleConfirm(deposit.id)}
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
