import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

export type JobStatus = "active" | "inactive" | "draft";

export type Job = {
  id: string;
  title: string;
  slug: string;
  type: string;
  description: string;
  started_at: string;
  ended_at: string;
  status: JobStatus;
  salary_range: {
    min: string;
    max: string;
    currency: string;
    display_text: string;
  };
  config?: Array<{
    field: string;
    status: "mandatory" | "optional" | "off";
  }>;
};

interface JobsQueryParams {
  search?: string;
  type?: string;
  status?: string;
  page?: number;
  limit?: number;
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

export function useJobs(params: JobsQueryParams = {}) {
  return useQuery<JobsResponse>({
    queryKey: ["jobs", "list", params],
    queryFn: async () => {
      const searchParams = new URLSearchParams();

      if (params.search) searchParams.set("q", params.search);
      if (params.type) searchParams.set("type", params.type);
      if (params.status) searchParams.set("status", params.status);
      if (params.page) searchParams.set("page", params.page.toString());
      if (params.limit) searchParams.set("limit", params.limit.toString());

      const url =
        searchParams.toString().length > 0
          ? `/api/jobs?${searchParams.toString()}`
          : "/api/jobs";

      const response = await fetch(url);

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to fetch jobs");
      }

      return response.json();
    },
    staleTime: 30 * 1000, // 30 seconds
    refetchOnWindowFocus: true,
    retry: (failureCount: number, error: Error) => {
      if (error.message.includes("Failed to fetch jobs")) {
        return false;
      }
      return failureCount < 3;
    },
  });
}

export function useDeleteJob() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (jobId: string) => {
      const response = await fetch(`/api/jobs/${jobId}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `Failed to delete job ID: ${jobId}`);
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["jobs"] });
      toast.success("Job deleted successfully");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to delete job");
    },
  });
}

export function useDeleteJobs() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (jobIds: string[]) => {
      const deletePromises = jobIds.map(async (jobId) => {
        const response = await fetch(`/api/jobs/${jobId}`, {
          method: "DELETE",
        });

        if (!response.ok) {
          throw new Error(`Failed to delete job ID: ${jobId}`);
        }

        return response.json();
      });

      return Promise.all(deletePromises);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["jobs"] });
      toast.success("Jobs deleted successfully");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to delete jobs");
    },
  });
}

export function useCreateJob() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (jobData: unknown) => {
      const response = await fetch("/api/jobs", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(jobData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to create job");
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["jobs"] });
      toast.success("Job created successfully");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to create job");
    },
  });
}
