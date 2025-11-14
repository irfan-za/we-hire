import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Job } from "@/hooks/use-jobs";
import { format, formatDistanceToNow } from "date-fns";
import { ChevronDown, MapPin, Clock, CircleDollarSign } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { getStatusVariant, getWorkArrangementVariant } from "@/lib/utils";

interface JobCardProps {
  job: Job;
  onManageClick?: (jobId: string) => void;
  onEditClick?: (job: Job) => void;
}

export default function JobCard({
  job,
  onManageClick,
  onEditClick,
}: JobCardProps) {
  const formatSalaryRange = () => {
    if (!job.salary_range) return null;
    return job.salary_range.display_text;
  };

  const formattedStartDate = job.started_at
    ? format(new Date(job.started_at), " d MMM yyyy")
    : null;

  return (
    <div className="border rounded-lg p-4 hover:outline-1 hover:outline-primary hover:bg-primary/5 hover:shadow-sm transition-shadow space-y-3">
      {onManageClick && onEditClick && (
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Badge variant={getStatusVariant(job.status)} className="shrink-0">
            {job.status}
          </Badge>
          {formattedStartDate && (
            <Badge variant="outline" className="shrink-0">
              started on {formattedStartDate}
            </Badge>
          )}
        </div>
      )}
      <h3 className="text-lg font-semibold truncate">{job.title}</h3>

      <div className="flex flex-col gap-2">
        <div className="text-sm text-muted-foreground flex items-center gap-2">
          <Avatar className="w-8 h-8 border rounded-sm">
            <AvatarImage
              src={
                "https://kpvelyodgrceuqxntpzj.supabase.co/storage/v1/object/public/images/rakamin-square.png"
              }
              alt={job.company}
            />
            <AvatarFallback>{(job.company || "?").charAt(0)}</AvatarFallback>
          </Avatar>
          <span>{job.company}</span>
        </div>
        <div className="text-sm text-muted-foreground flex items-center gap-2">
          <MapPin className="w-4 h-4" />
          <span className="truncate">{job.location}</span>
        </div>
        <div className="text-sm text-muted-foreground flex items-center gap-2">
          <CircleDollarSign className="w-4 h-4" />
          <span className="text-sm font-medium text-muted-foreground">
            {formatSalaryRange()}
          </span>
        </div>

        <div className="flex justify-between items-end pt-2">
          <div className="flex items-center gap-2">
            <Badge variant="outline">{job.type}</Badge>
            <Badge variant={getWorkArrangementVariant(job.work_arrangement)}>
              {job.work_arrangement}
            </Badge>
          </div>
          <span className="text-xs text-muted-foreground ">
            {job.started_at
              ? formatDistanceToNow(new Date(job.started_at), {
                  addSuffix: true,
                })
              : "-"}
          </span>
        </div>
      </div>

      {onManageClick && onEditClick && (
        <div className="flex items-center justify-between">
          <span className="text-sm font-semibold text-muted-foreground">
            {formatSalaryRange()}
          </span>

          <div className="flex items-center">
            <Button
              size="sm"
              className="rounded-r-none"
              onClick={() => onManageClick(job.id)}
            >
              Manage Job
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button size="sm" className="rounded-l-none" variant="outline">
                  <ChevronDown className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => onEditClick(job)}>
                  Edit Job
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      )}
    </div>
  );
}
