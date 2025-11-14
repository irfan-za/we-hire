"use client";

import JobFiltersClient from "@/components/job/job-filters-client";
import JobListClient from "@/components/job/job-list-client";
import JobDetail from "@/components/job/job-detail";
import { Job } from "@/types";
import { useSearchParams } from "next/navigation";
import { useMemo } from "react";

interface JobsPageClientProps {
  jobs: Job[];
  total: number;
}

export default function JobsPageClient({ jobs, total }: JobsPageClientProps) {
  const searchParams = useSearchParams();
  const externalId = searchParams.get("external_id");

  const selectedJob = useMemo(() => {
    if (!jobs || jobs.length === 0) return null;
    if (!externalId) {
      return jobs[0] || null;
    }
    return jobs.find((job) => job.slug === externalId) || null;
  }, [externalId, jobs]);

  return (
    <div className="min-h-[calc(100vh-4rem)] grid lg:grid-cols-10 p-3 gap-3">
      <div
        className={`${
          externalId ? "hidden lg:block" : ""
        } lg:col-span-3 flex flex-col items-center`}
      >
        <JobFiltersClient />
        <div className="w-full px-4">
          <JobListClient jobs={jobs} total={total} />
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
