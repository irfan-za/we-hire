import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Job } from "@/types";

interface JobDetailProps {
  job: Job;
}

export default function JobDetail({ job }: JobDetailProps) {
  return (
    <div className="flex flex-col justify-between w-full rounded-lg border border-border h-[calc(100vh-6rem)] overflow-y-auto">
      <div className="sticky top-0 z-10 bg-background rounded-t-lg flex flex-col gap-4 p-5">
        <div className="flex justify-between items-start">
          <div className="flex gap-4 w-full">
            <Avatar className="w-12 h-12 border rounded-sm">
              <AvatarImage
                src="https://kpvelyodgrceuqxntpzj.supabase.co/storage/v1/object/public/images/rakamin-square.png"
                alt={job.company}
              />
              <AvatarFallback>{(job.company || "?").charAt(0)}</AvatarFallback>
            </Avatar>
            <div className="flex gap-2 flex-col flex-1">
              <span className="text-sm bg-success text-primary-foreground py-0.5 px-2 rounded-sm capitalize w-fit">
                {job.type}
              </span>
              <h2 className="text-xl md:text-2xl font-bold">{job.title}</h2>
              <p className="text-muted-foreground">{job.company}</p>
            </div>
          </div>
          {job.isApplied ? (
            <Button variant={"secondary"} className="hidden lg:block" disabled>
              Applied
            </Button>
          ) : (
            <Button variant={"secondary"} asChild className="hidden lg:block">
              <Link href={`/apply-job/${job.slug}`}>Apply</Link>
            </Button>
          )}
        </div>
      </div>

      <div className="px-5 flex-1">
        <div className="border-t border-border" />

        <div className="flex flex-col gap-2 py-4">
          <div className="flex flex-col gap-2">
            <p className="text-sm md:text-base">{job.description}</p>
          </div>
        </div>
      </div>

      <div className="lg:hidden sticky bottom-0 bg-white border-t border-border p-2">
        {job.isApplied ? (
          <Button variant={"secondary"} className="w-full" disabled>
            Applied
          </Button>
        ) : (
          <Button variant={"secondary"} className="w-full" asChild>
            <Link href={`/apply-job/${job.slug}`}>Apply</Link>
          </Button>
        )}
      </div>
    </div>
  );
}
