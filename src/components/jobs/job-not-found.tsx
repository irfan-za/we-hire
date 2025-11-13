import Image from "next/image";
import { Button } from "@/components/ui/button";

interface JobNotFoundProps {
  searchQuery?: string;
  typeFilter?: string;
  statusFilter?: string;
  onCreateClick: () => void;
}

export default function JobNotFound({
  searchQuery,
  typeFilter,
  statusFilter,
  onCreateClick,
}: JobNotFoundProps) {
  const hasFilters = searchQuery || typeFilter || statusFilter;

  return (
    <div className="flex flex-col items-center text-center space-y-6 max-w-md p-8">
      <div className="relative w-32 md:w-48 h-32 md:h-48">
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
          {hasFilters
            ? "No jobs found matching your filters."
            : "Create a job opening now and start the candidate process."}
        </p>
      </div>
      <Button
        className="cursor-pointer md:px-8 bg-secondary hover:bg-secondary"
        onClick={onCreateClick}
      >
        Create a new job
      </Button>
    </div>
  );
}
