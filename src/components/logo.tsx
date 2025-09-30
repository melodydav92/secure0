import { cn } from "@/lib/utils";
import { Banknote } from "lucide-react";
import Link from "next/link";

export function Logo({ className }: { className?: string }) {
    return (
        <Link
          href="/dashboard"
          className={cn("flex items-center gap-2 text-lg font-semibold text-primary", className)}
        >
          <Banknote className="h-7 w-7" />
          <span>Kinsei</span>
        </Link>
    )
}
