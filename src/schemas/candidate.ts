import { z } from "zod";

export const candidateSchema = z.object({
  fullName: z
    .string()
    .min(2, { message: "Full name must be at least 2 characters" }),
  profilePicture: z.string().optional(),
  gender: z.enum(["male", "female"], { message: "Please select a gender" }),
  domicile: z
    .string()
    .min(2, { message: "Domicile must be at least 2 characters" }),
  email: z.string().email({ message: "Please enter a valid email address" }),
  phoneNumber: z
    .string()
    .min(10, { message: "Phone number must be at least 10 digits" }),
  linkedinLink: z.string().url({ message: "Please enter a valid URL" }),
  dateOfBirth: z.string().min(1, { message: "Date of birth is required" }),
});

export type CandidateFormData = z.infer<typeof candidateSchema>;
