import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Job } from "@/hooks/use-jobs";
import { format } from "date-fns";
import { ChevronDown } from "lucide-react";

interface JobCardProps {
  job: Job;
  onManageClick: (jobId: string) => void;
  onEditClick: (job: Job) => void;
}

export default function JobCard({
  job,
  onManageClick,
  onEditClick,
}: JobCardProps) {
  const getStatusVariant = (status: string) => {
    switch (status) {
      case "active":
        return "default";
      case "inactive":
        return "secondary";
      case "draft":
        return "outline";
      default:
        return "default";
    }
  };

  const formatSalaryRange = () => {
    if (!job.salary_range) return null;
    return job.salary_range.display_text;
  };

  const formattedStartDate = job.started_at
    ? format(new Date(job.started_at), " d MMM yyyy")
    : null;

  return (
    <div className="border rounded-lg p-4 hover:shadow-md transition-shadow space-y-3">
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
      <div>
        <h3 className="text-lg font-semibold truncate">{job.title}</h3>
      </div>

      <div className="flex items-center justify-between">
        <div className="text-sm font-semibold text-primary">
          {formatSalaryRange()}
        </div>
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
    </div>
  );
}
