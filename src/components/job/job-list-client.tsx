"use client";

import JobCard from "@/components/job/job-card";
import { Job } from "@/types";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { useCallback, useMemo } from "react";

interface JobListClientProps {
  jobs: Job[];
  total: number;
}

export default function JobListClient({ jobs, total }: JobListClientProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const externalId = searchParams.get("external_id");

  const selectedJob = useMemo(() => {
    if (!jobs || jobs.length === 0) return null;
    if (!externalId) {
      return jobs[0] || null;
    }
    return jobs.find((job) => job.slug === externalId) || null;
  }, [externalId, jobs]);

  const handleJobClick = useCallback(
    (job: Job) => {
      const params = new URLSearchParams(searchParams.toString());
      params.set("external_id", job.slug);
      router.push(`${pathname}?${params.toString()}`);
    },
    [searchParams, router, pathname]
  );

  return (
    <>
      <div className="text-sm text-muted-foreground mb-2">
        {total} vacanc{total !== 1 ? "ies" : "y"}
      </div>
      <div className="space-y-4 h-[calc(100vh-11rem)] overflow-y-auto p-1">
        {jobs.map((job) => (
          <div
            key={job.id}
            onClick={() => handleJobClick(job)}
            className={`cursor-pointer transition-all ${
              selectedJob?.id === job.id ? "ring-2 ring-primary rounded-lg" : ""
            }`}
          >
            <JobCard job={job} />
          </div>
        ))}
      </div>
    </>
  );
}
