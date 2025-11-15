import { Config } from "@/types";
import { z } from "zod";

const fieldSchemas = {
  fullName: z
    .string()
    .min(2, { message: "Full name must be at least 2 characters" }),
  profilePicture: z.union([
    z.string({ message: "profile picture is required" }),
    z.instanceof(File),
  ]),
  gender: z
    .enum(["male", "female"], { message: "Please select a gender" })
    .optional(),
  domicile: z
    .string()
    .min(2, { message: "Domicile must be at least 2 characters" }),
  email: z.string().email({ message: "Please enter a valid email address" }),
  phoneNumber: z
    .string()
    .min(10, { message: "Phone number must be at least 10 digits" }),
  linkedinLink: z.string().url({ message: "Please enter a valid URL" }),
  dateOfBirth: z.string().min(1, { message: "Date of birth is required" }),
};

const configKeyToFieldName: Record<string, keyof typeof fieldSchemas> = {
  "full-name": "fullName",
  "profile-picture": "profilePicture",
  gender: "gender",
  domicile: "domicile",
  email: "email",
  "phone-number": "phoneNumber",
  "linkedin-link": "linkedinLink",
  "date-of-birth": "dateOfBirth",
};

export function createDynamicCandidateSchema(config: Config[]) {
  const schemaShape: Record<string, z.ZodTypeAny> = {};

  config.forEach((field) => {
    const fieldName = configKeyToFieldName[field.key];

    if (!fieldName || field.status === "off") {
      return;
    }

    const baseSchema = fieldSchemas[fieldName];

    if (field.status === "mandatory") {
      schemaShape[fieldName] = baseSchema;
    } else if (field.status === "optional") {
      if (fieldName === "gender") {
        schemaShape[fieldName] = z.enum(["male", "female"]).optional();
      } else if (fieldName === "domicile") {
        schemaShape[fieldName] = z.string().min(2).optional().or(z.literal(""));
      } else if (fieldName === "phoneNumber") {
        schemaShape[fieldName] = z
          .string()
          .min(10)
          .optional()
          .or(z.literal(""));
      } else if (fieldName === "linkedinLink") {
        schemaShape[fieldName] = z.string().url().optional().or(z.literal(""));
      } else if (fieldName === "dateOfBirth") {
        schemaShape[fieldName] = z.string().optional().or(z.literal(""));
      } else {
        schemaShape[fieldName] = fieldSchemas[fieldName].optional();
      }
    }
  });

  return z.object(schemaShape);
}

export const candidateSchema = z.object({
  fullName: fieldSchemas.fullName,
  profilePicture: fieldSchemas.profilePicture,
  gender: fieldSchemas.gender,
  domicile: fieldSchemas.domicile,
  email: fieldSchemas.email,
  phoneNumber: fieldSchemas.phoneNumber,
  linkedinLink: fieldSchemas.linkedinLink,
  dateOfBirth: fieldSchemas.dateOfBirth,
});

export type CandidateFormData = z.infer<typeof candidateSchema>;
