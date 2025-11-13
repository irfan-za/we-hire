import CandidatesTable from "@/components/candidate/candidates-table";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import Link from "next/link";

interface PageProps {
  params: Promise<{
    id: string;
  }>;
}

async function getCandidates(jobId: string) {
  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_BASE_URL}/api/candidates?job_id=${jobId}`,
      {
        cache: "no-store",
      }
    );

    if (!response.ok) {
      return null;
    }

    const result = await response.json();
    return result.data;
  } catch {
    return null;
  }
}

export default async function ManageCandidatesPage({ params }: PageProps) {
  const { id } = await params;
  const candidates = await getCandidates(id);

  if (!candidates || candidates.length === 0) {
    return (
      <div className="container mx-auto py-10 px-6">
        <div className="flex flex-col items-center justify-center py-20 ">
          <div className="relative w-full h-36 md:h-48">
            <Image
              src="/images/candidate-not-found.svg"
              alt="No candidates found"
              fill
              className="mb-6 object-contain"
            />
          </div>
          <h2 className="text-xl font-semibold mb-2">No candidates found</h2>
          <p className="text-muted-foreground text-sm md:text-base text-center max-w-md">
            Share your job vacancies so that more candidates will apply.
          </p>
          <Button variant="secondary" className="mt-6" asChild>
            <Link href="/admin">Back to Job List</Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-10">
      <CandidatesTable jobId={id} jobTitle={candidates[0]?.job_id?.title} />
    </div>
  );
}
