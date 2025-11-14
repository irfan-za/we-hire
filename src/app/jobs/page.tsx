import Image from "next/image";
import { Job } from "@/types";
import JobsPageClient from "@/components/job/jobs-page-client";
import { createClient } from "@/lib/utils/supabase/server";
import { Button } from "@/components/ui/button";
import Link from "next/link";

interface JobsPageProps {
  searchParams: Promise<{
    type?: string;
    location?: string;
    external_id?: string;
  }>;
}

interface JobsResponse {
  data: Job[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

async function fetchJobs(
  type?: string,
  location?: string
): Promise<JobsResponse> {
  try {
    const supabase = await createClient();

    let query = supabase
      .from("jobs")
      .select(
        "id,title,slug,description,type,started_at,ended_at,status,work_arrangement,location,company,salary_range,config",
        { count: "exact" }
      )
      .eq("status", "active");

    if (type) {
      query = query.eq("type", type);
    }

    if (location) {
      query = query.ilike("location", `%${location}%`);
    }

    const { data, error, count } = await query.order("created_at", {
      ascending: false,
    });

    if (error) {
      throw error;
    }

    return {
      data: data || [],
      pagination: {
        page: 1,
        limit: 100,
        total: count || 0,
        totalPages: 1,
      },
    };
  } catch  {
    return {
      data: [],
      pagination: {
        page: 1,
        limit: 100,
        total: 0,
        totalPages: 1,
      },
    };
  }
}

export default async function JobsPage({ searchParams }: JobsPageProps) {
  const params = await searchParams;
  const selectedType = params.type || undefined;
  const selectedLocation = params.location || undefined;

  const { data: jobs, pagination } = await fetchJobs(
    selectedType,
    selectedLocation
  );

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
            Try adjusting your filters or check back later for new openings.
          </p>
          <Button
            className="cursor-pointer md:px-8 bg-secondary hover:bg-secondary"
            asChild
          >
            <Link href="/jobs">back to jobs</Link>
          </Button>
        </div>
      </div>
    );
  }

  return <JobsPageClient jobs={jobs} total={pagination.total} />;
}
