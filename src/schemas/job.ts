import { z } from "zod";

export const jobSchema = z
  .object({
    title: z
      .string()
      .min(3, { message: "Job title must be at least 3 characters" }),
    type: z.string({ message: "Please select a job type" }),
    description: z
      .string()
      .min(10, { message: "Job description must be at least 10 characters" }),
    startedAt: z.string().min(1, { message: "Start date is required" }),
    endedAt: z.string().min(1, { message: "End date is required" }),
    minSalary: z.string().optional(),
    maxSalary: z.string().optional(),
    config: z.array(
      z.object({
        key: z.string(),
        status: z.enum(["mandatory", "optional", "off"]),
      })
    ),
  })
  .refine((data) => new Date(data.startedAt) < new Date(data.endedAt), {
    message: "End date must be after start date",
    path: ["endedAt"],
  });

export type JobFormData = z.infer<typeof jobSchema>;
