import { Job } from "@/hooks/use-jobs";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { MapPin, Clock, Briefcase } from "lucide-react";
import { getExperienceLevel } from "@/lib/utils";
import Link from "next/link";

interface JobDetailProps {
  job: Job;
}

export default function JobDetail({ job }: JobDetailProps) {
  return (
    <div className="flex flex-col w-full rounded-lg border border-border h-[calc(100vh-6rem)] overflow-y-auto">
      <div className="sticky top-0 z-10 bg-background rounded-t-lg flex flex-col gap-4 p-5 border-b border-border">
        <div className="flex justify-between items-start">
          <div className="flex gap-2 flex-col flex-1">
            <div className="flex items-center gap-2 w-full">
              <Avatar className="w-6 h-6 border rounded-sm">
                <AvatarImage
                  src="https://kpvelyodgrceuqxntpzj.supabase.co/storage/v1/object/public/images/rakamin-square.png"
                  alt={job.company}
                />
                <AvatarFallback>
                  {(job.company || "?").charAt(0)}
                </AvatarFallback>
              </Avatar>
              <p className="text-sm text-muted-foreground">{job.company}</p>
            </div>
            <h2 className="text-xl md:text-2xl font-bold">{job.title}</h2>
            <div className="flex items-center gap-2 flex-wrap text-sm text-muted-foreground">
              <div className="flex items-center gap-1">
                <MapPin className="w-4 h-4" />
                <span>{job.location}</span>
              </div>
              <div className="w-1 h-1 rounded-full bg-muted-foreground" />
              <span className="capitalize">{job.work_arrangement}</span>
            </div>
          </div>
          <Button asChild className="hidden lg:block">
            <Link href={`/apply-job/${job.slug}`}>Apply</Link>
          </Button>
        </div>
      </div>

      <div className="px-5">
        <div className="flex flex-col gap-1 py-2">
          <div className="flex gap-2 items-center">
            <Clock className="text-muted-foreground w-3 h-3 md:w-4 md:h-4" />
            <p className="text-sm md:text-base text-muted-foreground capitalize">
              {job.type}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Briefcase className="text-muted-foreground w-3 h-3 md:w-4 md:h-4" />
            <p className="text-sm md:text-base text-muted-foreground">
              {getExperienceLevel(job.type)}
            </p>
          </div>
        </div>

        <div className="border-t border-border" />

        <div className="flex flex-col gap-2 py-4">
          <div className="flex flex-col gap-2">
            <h3 className="text-base md:text-lg font-bold">Description</h3>
            <p className="text-sm md:text-base text-muted-foreground ">
              {job.description}
            </p>
          </div>
        </div>
      </div>

      <div className="lg:hidden sticky bottom-0 bg-white border-t border-border p-2">
        <Button className="w-full" asChild>
          <Link href={`/apply-job/${job.slug}`}>Apply</Link>
        </Button>
      </div>
    </div>
  );
}
