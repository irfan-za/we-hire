"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
import JobDialog from "@/components/job/job-dialog";
import JobNotFound from "@/components/job/job-not-found";
import JobCtaCard from "@/components/job/job-cta-card";
import JobCard from "@/components/job/job-card";
import { useJobs } from "@/hooks/use-jobs";
import { useDebounce } from "@/hooks/use-debounce";
import { LoaderCircle, Plus, Search } from "lucide-react";
import React, { useState, useEffect } from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { Job } from "@/types";

export default function JobList() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingJob, setEditingJob] = useState<Job | undefined>(undefined);
  const [searchInput, setSearchInput] = useState("");

  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const searchQuery = searchParams.get("q") || "";
  const typeFilter = searchParams.get("type") || "";
  const statusFilter = searchParams.get("status") || "";
  const currentPage = parseInt(searchParams.get("page") || "1");
  const currentLimit = parseInt(searchParams.get("limit") || "10");

  const debouncedSearch = useDebounce(searchInput, 500);

  const updateParams = (updates: Record<string, string | null>) => {
    const params = new URLSearchParams(searchParams.toString());

    Object.entries(updates).forEach(([key, value]) => {
      if (value) {
        params.set(key, value);
      } else {
        params.delete(key);
      }
    });

    if (
      !updates.page &&
      (updates.q !== undefined ||
        updates.type !== undefined ||
        updates.status !== undefined)
    ) {
      params.set("page", "1");
    }

    router.push(`${pathname}?${params.toString()}`);
  };

  const { data, isLoading, error } = useJobs({
    search: searchQuery,
    type: typeFilter,
    status: statusFilter,
    page: currentPage,
    limit: currentLimit,
  });

  const jobs = data?.data || [];
  const pagination = data?.pagination || {
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 1,
  };
  const hasJobs = jobs.length > 0;

  const handleSearchChange = (value: string) => {
    setSearchInput(value);
  };

  const handleTypeChange = (value: string) => {
    updateParams({ type: value === "all" ? null : value });
  };

  const handleStatusChange = (value: string) => {
    updateParams({ status: value === "all" ? null : value });
  };

  const handlePageChange = (page: number) => {
    updateParams({ page: page.toString() });
  };

  const handleLimitChange = (value: string) => {
    updateParams({ limit: value, page: "1" });
  };

  const handleManageClick = (jobId: string) => {
    router.push(`/admin/${jobId}/candidates`);
  };
  const handleEditClick = (job: Job) => {
    setEditingJob(job);
    setIsDialogOpen(true);
  };

  useEffect(() => {
    setSearchInput(searchQuery);
  }, [searchQuery]);

  useEffect(() => {
    if (debouncedSearch !== searchQuery) {
      updateParams({ q: debouncedSearch || null });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedSearch]);

  return (
    <>
      <JobDialog
        open={isDialogOpen}
        onOpenChange={(open) => {
          setIsDialogOpen(open);
          if (!open) {
            setEditingJob(undefined);
          }
        }}
        job={editingJob}
      />
      <div className="min-h-[calc(100vh-4rem)] grid md:grid-cols-10 p-3 gap-3 lg:gap-6 container mx-auto">
        <div className="md:col-span-6 lg:col-span-7 flex flex-col items-center">
          <div className="w-full mb-4 space-y-4">
            <Button
              className="cursor-pointer px-6 md:hidden ml-auto flex "
              onClick={() => {
                setEditingJob(undefined);
                setIsDialogOpen(true);
              }}
            >
              <Plus className=" h-4 w-4" />
              Create a new job
            </Button>
            <div className="relative">
              <Input
                type="text"
                placeholder="Search by job details"
                className="pr-10 md:h-12"
                value={searchInput}
                onChange={(e) => handleSearchChange(e.target.value)}
              />
              <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 md:h-5 md:w-5 text-primary" />
            </div>

            <div className="flex gap-3">
              <Select
                value={typeFilter || "all"}
                onValueChange={handleTypeChange}
              >
                <SelectTrigger className="w-full max-w-48">
                  <SelectValue placeholder="Job Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="full-time">Full Time</SelectItem>
                  <SelectItem value="part-time">Part Time</SelectItem>
                  <SelectItem value="contract">Contract</SelectItem>
                  <SelectItem value="internship">Internship</SelectItem>
                  <SelectItem value="freelance">Freelance</SelectItem>
                </SelectContent>
              </Select>

              <Select
                value={statusFilter || "all"}
                onValueChange={handleStatusChange}
              >
                <SelectTrigger className="w-full max-w-48">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                  <SelectItem value="draft">Draft</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {isLoading ? (
            <div className="flex flex-col items-center space-y-4">
              <LoaderCircle className="animate-spin h-12 w-12" />
              <p className="text-muted-foreground">Loading jobs...</p>
            </div>
          ) : error ? (
            <div className="flex flex-col items-center space-y-4">
              <p className="text-destructive">Failed to load jobs</p>
              <Button onClick={() => window.location.reload()}>Retry</Button>
            </div>
          ) : !hasJobs ? (
            <JobNotFound
              searchQuery={searchQuery}
              typeFilter={typeFilter}
              statusFilter={statusFilter}
              onCreateClick={() => {
                setEditingJob(undefined);
                setIsDialogOpen(true);
              }}
            />
          ) : (
            <div className="w-full space-y-4 flex-1 flex flex-col justify-between">
              <div className="space-y-4">
                {jobs.map((job) => (
                  <JobCard
                    key={job.id}
                    job={job}
                    onManageClick={handleManageClick}
                    onEditClick={handleEditClick}
                  />
                ))}
              </div>

              {jobs.length > 0 && (
                <div className="flex flex-col sm:flex-row items-center justify-between py-1 md:py-3 border-t gap-4">
                  <div className="flex items-center gap-4 min-w-2xs">
                    <div className="text-xs text-muted-foreground">
                      Showing {(pagination.page - 1) * pagination.limit + 1} to{" "}
                      {Math.min(
                        pagination.page * pagination.limit,
                        pagination.total
                      )}{" "}
                      of {pagination.total} results
                    </div>
                    <div className="flex items-center gap-2">
                      <Select
                        value={currentLimit.toString()}
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
                      <span className="text-xs text-muted-foreground">
                        per page
                      </span>
                    </div>
                  </div>
                  {pagination.totalPages > 1 && (
                    <Pagination>
                      <PaginationContent className=" ml-auto">
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

                        {Array.from(
                          { length: pagination.totalPages },
                          (_, i) => {
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
                          }
                        )}

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
          )}
        </div>
        {/* right side */}
        <JobCtaCard
          onCreateClick={() => {
            setEditingJob(undefined);
            setIsDialogOpen(true);
          }}
        />
      </div>
    </>
  );
}
