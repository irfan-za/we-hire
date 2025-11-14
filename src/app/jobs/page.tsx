"use client";

import JobCard from "@/components/job/job-card";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import Image from "next/image";
import { useJobs } from "@/hooks/use-jobs";
import { useMemo, useCallback } from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";

export default function JobsPage() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const selectedType = searchParams.get("type") || "all";
  const selectedLocation = searchParams.get("location") || "all";

  const { data, isLoading, error } = useJobs({
    type: selectedType === "all" ? undefined : selectedType,
    location: selectedLocation === "all" ? undefined : selectedLocation,
    status: "active",
  });

  const jobs = useMemo(() => data?.data || [], [data]);
  const pagination = useMemo(() => data?.pagination || { total: 0 }, [data]);

  const updateParams = useCallback(
    (updates: Record<string, string | null>) => {
      const params = new URLSearchParams(searchParams.toString());
      Object.entries(updates).forEach(([key, value]) => {
        if (value !== null && value !== undefined) params.set(key, value);
        else params.delete(key);
      });
      router.push(`${pathname}?${params.toString()}`);
    },
    [searchParams, router, pathname]
  );

  const setType = (v: string) => updateParams({ type: v === "all" ? null : v });
  const setLocation = (v: string) =>
    updateParams({ location: v === "all" ? null : v });

  if (isLoading) {
    return (
      <div className="flex flex-col items-center text-center space-y-6 max-w-md p-8 mx-auto">
        <p className="text-muted-foreground">Loading jobs...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center text-center space-y-6 max-w-md p-8 mx-auto">
        <h2 className="text-xl font-bold text-destructive">
          Failed to load jobs
        </h2>
        <p className="text-muted-foreground text-sm">{error.message}</p>
      </div>
    );
  }

  if (jobs.length === 0) {
    return (
      <div className="flex flex-col items-center text-center space-y-6 max-w-md p-8 mx-auto">
        <div className="relative w-48 h-48">
          <Image
            src="/images/not-found.svg"
            alt="No job openings available"
            fill
            className="object-contain"
          />
        </div>
        <div className="space-y-1">
          <h2 className="text-xl font-bold">No job openings available</h2>
          <p className="text-muted-foreground text-sm">
            Create a job opening now and start the candidate process.
          </p>
        </div>
      </div>
    );
  }
  return (
    <div className="min-h-[calc(100vh-4rem)] grid grid-cols-10 p-3 gap-3">
      <div className="col-span-3 flex flex-col items-center">
        <div className="w-full max-w-2xl px-4 mb-4 flex gap-3">
          <Select value={selectedType} onValueChange={(v) => setType(v)}>
            <SelectTrigger className="w-48 h-12">
              <SelectValue placeholder="Job Type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              <SelectItem value="full-time">Full Time</SelectItem>
              <SelectItem value="part-time">Part Time</SelectItem>
              <SelectItem value="contract">Contract</SelectItem>
              <SelectItem value="internship">Internship</SelectItem>
            </SelectContent>
          </Select>

          <Select
            value={selectedLocation}
            onValueChange={(v) => setLocation(v)}
          >
            <SelectTrigger className="w-48 h-12">
              <SelectValue placeholder="Location" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Locations</SelectItem>
              <SelectItem value="jakarta">Jakarta</SelectItem>
              <SelectItem value="bandung">Bandung</SelectItem>
              <SelectItem value="remote">Remote</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="w-full px-4">
          <div className="text-sm text-muted-foreground mb-2">
            {pagination.total} vacanc
            {pagination.total !== 1 ? "ies" : "y"}
          </div>
          <div className="space-y-4 h-[calc(100vh-11rem)] overflow-y-auto p-1">
            {jobs.map((job) => (
              <JobCard key={job.id} job={job} />
            ))}
          </div>
        </div>
      </div>
      <div className="col-span-7">job description</div>
    </div>
  );
}
