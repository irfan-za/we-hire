import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

export type Candidate = {
  id: string;
  job_id: string;
  full_name: string;
  email: string;
  phone: string;
  date_of_birth: string;
  domicile: string;
  gender: string;
  linkedin_link: string | null;
  created_at: string;
};

interface CandidatesQueryParams {
  gender?: string;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
  page?: number;
  limit?: number;
}

interface CandidatesResponse {
  data: Candidate[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export function useCandidates(
  jobId: string,
  params: CandidatesQueryParams = {}
) {
  return useQuery<CandidatesResponse>({
    queryKey: ["candidates", jobId, params],
    queryFn: async () => {
      const searchParams = new URLSearchParams();
      searchParams.set("job_id", jobId);

      if (params.gender) searchParams.set("gender", params.gender);
      if (params.sortBy) searchParams.set("sort_by", params.sortBy);
      if (params.sortOrder) searchParams.set("sort_order", params.sortOrder);
      if (params.page) searchParams.set("page", params.page.toString());
      if (params.limit) searchParams.set("limit", params.limit.toString());

      const response = await fetch(
        `/api/candidates?${searchParams.toString()}`
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to fetch candidates");
      }

      return response.json();
    },
    enabled: !!jobId,
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchOnWindowFocus: true,
  });
}
export const useDeleteCandidate = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) =>
      await fetch(`/api/candidates/${id}`, { method: "DELETE" }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["candidates"] }),
  });
};
