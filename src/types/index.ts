export interface UserData {
  email: string;
  full_name: string;
}

export type JobStatus = "active" | "inactive" | "draft";
export type WorkArrangement = "remote" | "onsite" | "hybrid";
export type JobConfigStatus = "mandatory" | "optional" | "off";
export type Config = {
  key: string;
  status: JobConfigStatus;
};
export type Job = {
  id: string;
  title: string;
  slug: string;
  type: string;
  description: string;
  started_at: string;
  ended_at: string;
  status: JobStatus;
  work_arrangement: WorkArrangement;
  location: string;
  company: string;
  salary_range: {
    min: string;
    max: string;
    currency: string;
    display_text: string;
  };
  config?: Array<Config>;
  isApplied?: boolean;
};
