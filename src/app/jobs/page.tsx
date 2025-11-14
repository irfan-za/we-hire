"use client";

import JobCard from "@/components/job/job-card";
import JobDetail from "@/components/job/job-detail";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import Image from "next/image";
import { useJobs, Job } from "@/hooks/use-jobs";
import { useMemo, useCallback } from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";

export default function JobsPage() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const selectedType = searchParams.get("type") || "all";
  const selectedLocation = searchParams.get("location") || "all";
  const externalId = searchParams.get("external_id");

  const { data, isLoading, error } = useJobs({
    type: selectedType === "all" ? undefined : selectedType,
    location: selectedLocation === "all" ? undefined : selectedLocation,
    status: "active",
  });

  const jobs = useMemo(() => data?.data || [], [data]);
  const pagination = useMemo(() => data?.pagination || { total: 0 }, [data]);

  const selectedJob = useMemo(() => {
    if (!jobs || jobs.length === 0) return null;
    if (!externalId) {
      return jobs[0] || null;
    }

    return jobs.find((job) => job.slug === externalId) || null;
  }, [externalId, jobs]);

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

  const setType = (v: string) =>
    updateParams({ type: v === "all" ? null : v, external_id: null });
  const setLocation = (v: string) =>
    updateParams({ location: v === "all" ? null : v, external_id: null });

  const handleJobClick = useCallback(
    (job: Job) => {
      const params = new URLSearchParams(searchParams.toString());
      params.set("external_id", job.slug);
      router.push(`${pathname}?${params.toString()}`);
    },
    [searchParams, router, pathname]
  );

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
    <div className="min-h-[calc(100vh-4rem)] grid lg:grid-cols-10 p-3 gap-3">
      <div
        className={`${
          externalId ? "hidden lg:block" : ""
        } lg:col-span-3 flex flex-col items-center`}
      >
        <div className="w-full px-4 mb-4 flex gap-3">
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
              <SelectItem value="yogyakarta">Yogyakarta</SelectItem>
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
              <div
                key={job.id}
                onClick={() => handleJobClick(job)}
                className={`cursor-pointer transition-all ${
                  selectedJob?.id === job.id
                    ? "ring-2 ring-primary rounded-lg"
                    : ""
                }`}
              >
                <JobCard job={job} />
              </div>
            ))}
          </div>
        </div>
      </div>
      <div className={`${!externalId ? "hidden lg:block" : ""} lg:col-span-7`}>
        {selectedJob ? (
          <JobDetail job={selectedJob} />
        ) : (
          <div className="flex items-center justify-center h-full text-muted-foreground">
            <p>Select a job to view details</p>
          </div>
        )}
      </div>
    </div>
  );
}
