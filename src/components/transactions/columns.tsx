"use client"

import { ColumnDef } from "@tanstack/react-table"
import { Badge } from "../ui/badge"
import { cn } from "@/lib/utils"
import type { FormattedTransaction } from "@/lib/definitions"
import { ArrowUpDown } from "lucide-react"
import { Button } from "../ui/button"

export const columns: ColumnDef<FormattedTransaction>[] = [
  {
    accessorKey: "description",
    header: "Description",
  },
  {
    accessorKey: "date",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Date
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      )
    },
  },
  {
    accessorKey: "type",
    header: "Type",
    cell: ({ row }) => {
        const type = row.original.type
        return <Badge
            variant="outline"
            className={cn(
                "capitalize",
                type === 'deposit' && 'border-green-500 text-green-700',
                type === 'withdrawal' && 'border-red-500 text-red-700',
                type === 'transfer' && 'border-blue-500 text-blue-700'
            )}
        >
            {type}
        </Badge>
    }
  },
  {
    accessorKey: "status",
    header: "Status",
     cell: ({ row }) => {
        const status = row.original.status
        return <Badge
            variant={status === 'completed' ? 'default' : status === 'flagged' ? 'destructive' : 'secondary'}
            className={cn('capitalize', status === 'completed' && 'bg-green-100 text-green-800')}
        >
            {status}
        </Badge>
    }
  },
  {
    accessorKey: "amount",
    header: () => <div className="text-right">Amount</div>,
    cell: ({ row }) => {
      const amount = row.original.amount
      const isPositive = !amount.startsWith('-')
      
      return <div className={cn("text-right font-medium", isPositive ? "text-green-600" : "text-red-600")}>{amount}</div>
    },
  },
]
