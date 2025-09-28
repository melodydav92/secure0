import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { cn, formatCurrency } from "@/lib/utils";
import type { Transaction } from '@prisma/client';

type RecentTransactionsProps = {
    transactions: Transaction[];
    currency: string;
}

export function RecentTransactions({ transactions, currency }: RecentTransactionsProps) {
  if (transactions.length === 0) {
    return <p className="text-muted-foreground text-center">No recent transactions.</p>
  }
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Description</TableHead>
          <TableHead>Type</TableHead>
          <TableHead>Date</TableHead>
          <TableHead>Status</TableHead>
          <TableHead className="text-right">Amount</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {transactions.map((tx) => (
          <TableRow key={tx.id}>
            <TableCell className="font-medium">{tx.description}</TableCell>
            <TableCell>
                 <Badge
                    variant="outline"
                    className={cn(
                        tx.type === 'deposit' && 'border-green-500 text-green-700',
                        tx.type === 'withdrawal' && 'border-red-500 text-red-700',
                        tx.type === 'transfer' && 'border-blue-500 text-blue-700'
                    )}
                >
                    {tx.type}
                </Badge>
            </TableCell>
            <TableCell>{new Date(tx.createdAt).toLocaleDateString()}</TableCell>
            <TableCell>
                 <Badge
                    variant={tx.status === 'completed' ? 'default' : tx.status === 'flagged' ? 'destructive' : 'secondary'}
                    className={cn(tx.status === 'completed' && 'bg-green-100 text-green-800')}
                >
                    {tx.status}
                </Badge>
            </TableCell>
            <TableCell
              className={cn("text-right font-semibold", tx.amount > 0 ? "text-green-600" : "text-red-600")}
            >
              {tx.amount > 0 ? `+${formatCurrency(tx.amount, currency)}` : formatCurrency(tx.amount, currency)}
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
