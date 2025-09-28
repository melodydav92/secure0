import { getFilteredTransactions, getUserData } from "@/lib/data";
import { format } from "date-fns";
import { formatCurrency } from "@/lib/utils";
import type { FormattedTransaction } from "@/lib/definitions";
import { DataTable } from "@/components/transactions/data-table";
import { columns } from "@/components/transactions/columns";
import Search from "@/components/transactions/search";
import Pagination from "@/components/transactions/pagination";

export default async function TransactionsPage({
  searchParams,
}: {
  searchParams: {
    query?: string;
    page?: string;
  };
}) {
  const query = searchParams.query || '';
  const currentPage = Number(searchParams.page) || 1;

  const { transactions, totalPages } = await getFilteredTransactions(query, currentPage);
  const userData = await getUserData();

  const formattedTransactions: FormattedTransaction[] = transactions.map(tx => ({
    id: tx.id,
    type: tx.type,
    amount: formatCurrency(tx.amount, userData.currency),
    status: tx.status,
    date: format(new Date(tx.createdAt), 'MMM d, yyyy'),
    description: tx.description ?? '-',
  }));

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Transactions</h1>
        <p className="text-muted-foreground">View and manage your transaction history.</p>
      </div>
      <div className="space-y-4">
        <div className="flex items-center justify-between">
            <Search placeholder="Search transactions..." />
        </div>
        <DataTable columns={columns} data={formattedTransactions} />
        <div className="mt-4">
            <Pagination totalPages={totalPages} />
        </div>
      </div>
    </div>
  );
}
