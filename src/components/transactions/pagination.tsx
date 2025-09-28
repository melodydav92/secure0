'use client';

import { ArrowLeftIcon, ArrowRightIcon } from 'lucide-react';
import { usePathname, useSearchParams } from 'next/navigation';
import { Button } from '../ui/button';
import { cn } from '@/lib/utils';
import Link from 'next/link';
import {
  Pagination as ShadPagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination"

export default function Pagination({ totalPages }: { totalPages: number }) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const currentPage = Number(searchParams.get('page')) || 1;

  const createPageURL = (pageNumber: number | string) => {
    const params = new URLSearchParams(searchParams);
    params.set('page', pageNumber.toString());
    return `${pathname}?${params.toString()}`;
  };

  return (
    <ShadPagination>
      <PaginationContent>
        <PaginationItem>
          <PaginationPrevious href={createPageURL(currentPage - 1)} aria-disabled={currentPage <= 1} />
        </PaginationItem>

        <PaginationItem>
            <PaginationLink href={createPageURL(1)} isActive={currentPage === 1}>1</PaginationLink>
        </PaginationItem>
        {currentPage > 3 && <PaginationEllipsis />}

        {currentPage > 2 && <PaginationItem>
            <PaginationLink href={createPageURL(currentPage - 1)}>{currentPage - 1}</PaginationLink>
        </PaginationItem>}

        {currentPage !== 1 && currentPage !== totalPages && <PaginationItem>
            <PaginationLink href={createPageURL(currentPage)} isActive>{currentPage}</PaginationLink>
        </PaginationItem>}

        {currentPage < totalPages - 1 && <PaginationItem>
            <PaginationLink href={createPageURL(currentPage + 1)}>{currentPage + 1}</PaginationLink>
        </PaginationItem>}

        {currentPage < totalPages - 2 && <PaginationEllipsis />}
        {totalPages > 1 && <PaginationItem>
            <PaginationLink href={createPageURL(totalPages)} isActive={currentPage === totalPages}>{totalPages}</PaginationLink>
        </PaginationItem>}

        <PaginationItem>
          <PaginationNext href={createPageURL(currentPage + 1)} aria-disabled={currentPage >= totalPages} />
        </PaginationItem>
      </PaginationContent>
    </ShadPagination>
  );
}
