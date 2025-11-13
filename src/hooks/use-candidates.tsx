import { useQuery } from "@tanstack/react-query";

export type Candidate = {
  id: string;
  job_id: string;
  full_name: string;
  email: string;
  phone: string;
  date_of_birth: string;
  domicile: string;
  gender: string;
  linkedin_url: string | null;
  created_at: string;
};

interface CandidatesResponse {
  data: Candidate[];
}

export function useCandidates(jobId: string) {
  return useQuery<CandidatesResponse>({
    queryKey: ["candidates", jobId],
    queryFn: async () => {
      const response = await fetch(`/api/candidates?job_id=${jobId}`);

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to fetch candidates");
      }

      return response.json();
    },
    enabled: !!jobId,
    staleTime: 30 * 1000,
    refetchOnWindowFocus: true,
  });
}
