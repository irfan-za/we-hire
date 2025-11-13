"use client";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Checkbox } from "@/components/ui/checkbox";
import { useCandidates } from "@/hooks/use-candidates";
import { LoaderCircle, ArrowUpDown, ArrowUp, ArrowDown } from "lucide-react";
import { useState } from "react";
import Link from "next/link";
import { formatDate } from "@/lib/utils";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";

interface CandidatesTableProps {
  jobId: string;
  jobTitle: string;
}
type SortOrder = "asc" | "desc";
export default function CandidatesTable({
  jobId,
  jobTitle,
}: CandidatesTableProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [selectedCandidates, setSelectedCandidates] = useState<string[]>([]);

  const genderParam = searchParams.get("gender") || "";
  const pageParam = parseInt(searchParams.get("page") || "1");
  const limitParam = parseInt(searchParams.get("limit") || "10");
  const sortByParam = searchParams.get("sort_by") || "created_at";
  const sortOrderParam =
    (searchParams.get("sort_order") as SortOrder) || "desc";

  const candidatesQueryParams = {
    gender: genderParam || undefined,
    sortBy: sortByParam,
    sortOrder: sortOrderParam,
    page: pageParam,
    limit: limitParam,
  };

  const { data, isLoading, error } = useCandidates(
    jobId,
    candidatesQueryParams
  );

  const candidates = data?.data || [];
  const pagination = data?.pagination || {
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedCandidates(candidates.map((c) => c.id));
    } else {
      setSelectedCandidates([]);
    }
  };

  const handleSelectCandidate = (candidateId: string, checked: boolean) => {
    if (checked) {
      setSelectedCandidates([...selectedCandidates, candidateId]);
    } else {
      setSelectedCandidates(
        selectedCandidates.filter((id) => id !== candidateId)
      );
    }
  };

  const updateParams = (updates: Record<string, string | null>) => {
    const params = new URLSearchParams(searchParams.toString());

    Object.entries(updates).forEach(([key, value]) => {
      if (value !== null && value !== undefined) {
        params.set(key, value);
      } else {
        params.delete(key);
      }
    });

    if (
      !updates.page &&
      (updates.gender !== undefined || updates.limit !== undefined)
    ) {
      params.set("page", "1");
    }

    router.push(`${pathname}?${params.toString()}`);
  };

  const handleGenderChange = (value: string) => {
    updateParams({ gender: value === "all" ? null : value, page: "1" });
  };

  const handlePageChange = (page: number) => {
    updateParams({ page: page.toString() });
    setSelectedCandidates([]);
  };

  const handleLimitChange = (value: string) => {
    updateParams({ limit: value, page: "1" });
    setSelectedCandidates([]);
  };

  const handleToggleSortFullName = () => {
    if (sortByParam !== "full_name") {
      updateParams({ sort_by: "full_name", sort_order: "asc", page: "1" });
    } else {
      const next = sortOrderParam === "asc" ? "desc" : "asc";
      updateParams({ sort_by: "full_name", sort_order: next, page: "1" });
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-12 space-y-4">
        <LoaderCircle className="animate-spin h-12 w-12" />
        <p className="text-muted-foreground">Loading candidates...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-12 space-y-4">
        <p className="text-destructive">Failed to load candidates</p>
        <p className="text-sm text-muted-foreground">{error.message}</p>
      </div>
    );
  }

  return (
    <div className="space-y-4 p-3">
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
            <Link href="/admin" className="hover:text-foreground">
              Job list
            </Link>
            <span>/</span>
            <span className="text-foreground">Manage Candidate</span>
          </div>
          <h1 className="text-2xl font-semibold">{jobTitle}</h1>
        </div>
        <Select value={genderParam} onValueChange={handleGenderChange}>
          <SelectTrigger>
            <SelectValue placeholder="Filter by gender" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Genders</SelectItem>
            <SelectItem value="male">Male</SelectItem>
            <SelectItem value="female">Female</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-12">
                <Checkbox
                  checked={
                    candidates.length > 0 &&
                    selectedCandidates.length === candidates.length
                  }
                  onCheckedChange={handleSelectAll}
                />
              </TableHead>
              <TableHead>
                <button
                  type="button"
                  className="flex items-center gap-2"
                  onClick={handleToggleSortFullName}
                >
                  <span>FULL NAME</span>
                  {sortByParam === "full_name" ? (
                    sortOrderParam === "asc" ? (
                      <ArrowUp className="h-4 w-4" />
                    ) : (
                      <ArrowDown className="h-4 w-4" />
                    )
                  ) : (
                    <ArrowUpDown className="h-4 w-4 opacity-60" />
                  )}
                </button>
              </TableHead>
              <TableHead>EMAIL ADDRESS</TableHead>
              <TableHead>PHONE NUMBERS</TableHead>
              <TableHead>DATE OF BIRTH</TableHead>
              <TableHead>DOMICILE</TableHead>
              <TableHead>GENDER</TableHead>
              <TableHead>LINK LINKEDIN</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {candidates.length > 0 &&
              candidates.map((candidate) => (
                <TableRow key={candidate.id}>
                  <TableCell>
                    <Checkbox
                      checked={selectedCandidates.includes(candidate.id)}
                      onCheckedChange={(checked) =>
                        handleSelectCandidate(candidate.id, checked as boolean)
                      }
                    />
                  </TableCell>
                  <TableCell className="font-medium">
                    {candidate.full_name}
                  </TableCell>
                  <TableCell>{candidate.email}</TableCell>
                  <TableCell>{candidate.phone ?? "-"}</TableCell>
                  <TableCell>
                    {formatDate(candidate.date_of_birth) ?? "-"}
                  </TableCell>
                  <TableCell className="truncate block max-w-[200px]">
                    {candidate.domicile ?? "-"}
                  </TableCell>
                  <TableCell className="capitalize">
                    {candidate.gender ?? "-"}
                  </TableCell>
                  <TableCell>
                    {candidate.linkedin_link ? (
                      <Link
                        href={candidate.linkedin_link}
                        target="_blank"
                        className="text-blue-600 hover:underline truncate block max-w-[200px]"
                      >
                        {candidate.linkedin_link}
                      </Link>
                    ) : (
                      <span className="text-muted-foreground">-</span>
                    )}
                  </TableCell>
                </TableRow>
              ))}
          </TableBody>
        </Table>
      </div>

      {candidates.length > 0 && (
        <div className="flex flex-col sm:flex-row items-end md:items-center justify-between py-1 md:py-3 border-t gap-4">
          <div className="flex items-center gap-4 min-w-xs">
            <div className="text-xs text-muted-foreground ml-auto md:ml-0">
              Showing {(pagination.page - 1) * pagination.limit + 1} to{" "}
              {Math.min(pagination.page * pagination.limit, pagination.total)}{" "}
              of {pagination.total} results
            </div>
            <div className="flex items-center gap-2">
              <Select
                value={pagination.limit.toString()}
                onValueChange={handleLimitChange}
              >
                <SelectTrigger className="w-16">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="10">10</SelectItem>
                  <SelectItem value="20">20</SelectItem>
                  <SelectItem value="50">50</SelectItem>
                  <SelectItem value="100">100</SelectItem>
                </SelectContent>
              </Select>
              <span className="text-xs text-muted-foreground">per page</span>
            </div>
          </div>
          {pagination.totalPages > 1 && (
            <Pagination>
              <PaginationContent className="ml-auto">
                <PaginationItem>
                  <PaginationPrevious
                    href="#"
                    onClick={(e) => {
                      e.preventDefault();
                      if (pagination.page > 1) {
                        handlePageChange(pagination.page - 1);
                      }
                    }}
                    className={
                      pagination.page <= 1
                        ? "pointer-events-none opacity-50"
                        : ""
                    }
                  />
                </PaginationItem>

                {Array.from({ length: pagination.totalPages }, (_, i) => {
                  const pageNum = i + 1;
                  const isCurrentPage = pageNum === pagination.page;

                  const showPage =
                    pageNum === 1 ||
                    pageNum === pagination.totalPages ||
                    Math.abs(pageNum - pagination.page) <= 1;

                  if (!showPage) {
                    if (
                      pageNum === pagination.page - 2 ||
                      pageNum === pagination.page + 2
                    ) {
                      return (
                        <PaginationItem key={pageNum}>
                          <span className="px-2">...</span>
                        </PaginationItem>
                      );
                    }
                    return null;
                  }

                  return (
                    <PaginationItem key={pageNum}>
                      <PaginationLink
                        href="#"
                        onClick={(e) => {
                          e.preventDefault();
                          handlePageChange(pageNum);
                        }}
                        isActive={isCurrentPage}
                      >
                        {pageNum}
                      </PaginationLink>
                    </PaginationItem>
                  );
                })}

                <PaginationItem>
                  <PaginationNext
                    href="#"
                    onClick={(e) => {
                      e.preventDefault();
                      if (pagination.page < pagination.totalPages) {
                        handlePageChange(pagination.page + 1);
                      }
                    }}
                    className={
                      pagination.page >= pagination.totalPages
                        ? "pointer-events-none opacity-50"
                        : ""
                    }
                  />
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          )}
        </div>
      )}
    </div>
  );
}
