import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";

export type PaginationProps = {
  currentPage: number;
  totalPages: number;
  baseUrl: string;
};

export function Pagination({ currentPage, totalPages, baseUrl }: PaginationProps) {
  if (totalPages <= 1) return null;

  return (
    <div className="flex items-center justify-center gap-2 mt-8">
      {currentPage > 1 ? (
        <Link href={`${baseUrl}?page=${currentPage - 1}`} className="btn btn-outline px-3">
          <ChevronLeft className="size-4" />
        </Link>
      ) : (
        <Button className="btn-outline px-3 opacity-50" disabled={true}>
          <ChevronLeft className="size-4" />
        </Button>
      )}
      
      <div className="text-sm font-medium px-4">
        Page {currentPage} of {totalPages}
      </div>

      {currentPage < totalPages ? (
        <Link href={`${baseUrl}?page=${currentPage + 1}`} className="btn btn-outline px-3">
          <ChevronRight className="size-4" />
        </Link>
      ) : (
        <Button className="btn-outline px-3 opacity-50" disabled={true}>
          <ChevronRight className="size-4" />
        </Button>
      )}
    </div>
  );
}
