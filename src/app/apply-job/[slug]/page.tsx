import { notFound, redirect, RedirectType } from "next/navigation";
import ApplyJobForm from "@/components/job/apply-job-form";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { Job } from "@/types";
import { createClient } from "@/lib/utils/supabase/server";

interface PageProps {
  params: Promise<{
    slug: string;
  }>;
}
type JobHeader = Pick<Job, "id" | "title" | "company" | "config">;

async function getJobBySlug(slug: string): Promise<JobHeader | null> {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("jobs")
      .select("id,title,company,config")
      .eq("slug", slug)
      .eq("status", "active")
      .single();

    if (error) {
      if (error.code === "PGRST116") {
        return notFound();
      }
      throw error;
    }
    return data;
  } catch {
    return null;
  }
}

export default async function ApplyJobPage({ params }: PageProps) {
  const { slug } = await params;
  const job = await getJobBySlug(slug);
  if (!job) {
    notFound();
  }

  const supabase = await createClient();
  const {
    data: { user: currentUser },
  } = await supabase.auth.getUser();

  if (currentUser) {
    const { data: existingApplications } = await supabase
      .from("candidates")
      .select("id")
      .eq("job_id", job.id)
      .eq("auth_id", currentUser.id)
      .limit(1);

    if (existingApplications && existingApplications.length > 0) {
      return redirect("/jobs", RedirectType.replace);
    }
  }

  return (
    <div className="min-h-screen bg-accent/30 py-8">
      <div className="container mx-auto px-4 max-w-2xl">
        <div className="flex items-center space-x-4 mb-3 max-w-xl">
          <Link
            href="/jobs"
            className="inline-flex items-center p-1 text-sm text-muted-foreground hover:text-foreground rounded-md border "
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <p className="font-semibold text-lg pb-1 text-foreground">
            Apply {job.title} at {job.company}
          </p>
        </div>

        <ApplyJobForm job={job} />
      </div>
    </div>
  );
}
