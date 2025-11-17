"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  candidateSchema,
  CandidateFormData,
  createDynamicCandidateSchema,
} from "@/schemas/candidate";
import { zodResolver } from "@hookform/resolvers/zod";
import { Camera, User } from "lucide-react";
import React, { useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Config, Job, JobConfigStatus } from "@/types";
import CameraCaptureDialog from "./camera-capture-dialog";

interface ApplyJobFormProps {
  job: Pick<Job, "id" | "title" | "company" | "config">;
}

const fieldLabels: Record<string, string> = {
  "full-name": "Full name",
  "profile-picture": "Profile picture",
  gender: "Pronoun (gender)",
  domicile: "Domicile",
  email: "Email",
  "phone-number": "Phone number",
  "linkedin-link": "Link Linkedin",
  "date-of-birth": "Date of birth",
};

export default function ApplyJobForm({ job }: ApplyJobFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [profilePicturePreview, setProfilePicturePreview] = useState<
    string | null
  >(null);
  const [profilePictureFile, setProfilePictureFile] = useState<File | null>(
    null
  );
  const [isCameraDialogOpen, setIsCameraDialogOpen] = useState(false);

  const maxDate = (() => {
    const d = new Date();
    d.setDate(d.getDate() - 1);
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, "0");
    const dd = String(d.getDate()).padStart(2, "0");
    return `${yyyy}-${mm}-${dd}`;
  })();

  const config: Config[] = useMemo(() => job.config || [], [job.config]);
  const dynamicSchema = useMemo(
    () => createDynamicCandidateSchema(config),
    [config]
  );

  const getFieldStatus = (key: string): JobConfigStatus => {
    const field = config.find((c) => c.key === key);
    return field?.status || "off";
  };

  const isFieldRequired = (key: string) => {
    return getFieldStatus(key) === "mandatory";
  };

  const isFieldVisible = (key: string) => {
    const status = getFieldStatus(key);
    return status === "mandatory" || status === "optional";
  };

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<Partial<CandidateFormData>>({
    resolver: zodResolver(dynamicSchema),
  });

  const handleFieldChange = <K extends keyof CandidateFormData>(
    field: K,
    value: CandidateFormData[K]
  ) => {
    setValue(field, value as any);
  };

  const handleCameraCapture = (imageFile: File, previewUrl: string) => {
    setProfilePicturePreview(previewUrl);
    setProfilePictureFile(imageFile);
    setValue("profilePicture", imageFile as any);
  };

  const onSubmit = async (data: Partial<CandidateFormData>) => {
    setLoading(true);

    try {
      const formData = new FormData();
      formData.append("jobId", job.id);

      if (data.fullName) formData.append("fullName", data.fullName);
      if (data.gender) formData.append("gender", data.gender);
      if (data.domicile) formData.append("domicile", data.domicile);
      if (data.email) formData.append("email", data.email);
      if (data.phoneNumber) formData.append("phoneNumber", data.phoneNumber);
      if (data.linkedinLink) formData.append("linkedinLink", data.linkedinLink);
      if (data.dateOfBirth) formData.append("dateOfBirth", data.dateOfBirth);

      if (profilePictureFile) {
        formData.append("profilePicture", profilePictureFile);
      }

      const response = await fetch("/api/candidates", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to submit application");
      }

      toast.success("Application submitted successfully!", {
        description:
          "We will review your application and get back to you soon.",
      });

      router.push("/jobs");
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to submit application"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-xl mx-auto bg-background rounded-lg shadow-sm p-6">
      <CameraCaptureDialog
        open={isCameraDialogOpen}
        onOpenChange={setIsCameraDialogOpen}
        onCapture={handleCameraCapture}
      />

      <div className="mb-6">
        <div className="flex items-center gap-2 text-sm text-muted-foreground mb-4">
          <span className="text-destructive">*</span>
          <span>Required</span>
        </div>

        {isFieldVisible("profile-picture") && (
          <div className="mb-6">
            <Label className="text-sm text-foreground mb-2 block">
              {fieldLabels["profile-picture"]}
              {isFieldRequired("profile-picture") && (
                <span className="text-destructive">*</span>
              )}
            </Label>
            <div className="flex flex-col items-center w-fit">
              <div className="relative w-24 h-24 rounded-full bg-accent overflow-hidden mb-3">
                {profilePicturePreview ? (
                  <Image
                    src={profilePicturePreview}
                    alt="Profile preview"
                    fill
                    className="object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <User className="w-8 h-8 text-muted-foreground" />
                  </div>
                )}
              </div>
              <Button
                type="button"
                onClick={() => setIsCameraDialogOpen(true)}
                className="flex items-center gap-2 px-4 py-2 bg-accent text-foreground rounded-full hover:bg-accent/80 transition-colors"
              >
                <Camera className="w-4 h-4" />
                <span className="text-sm">Take a Picture</span>
              </Button>
            </div>
            {errors.profilePicture && (
              <p className="text-xs text-destructive">
                {errors.profilePicture.message}
              </p>
            )}
          </div>
        )}
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {isFieldVisible("full-name") && (
          <div className="space-y-2">
            <Label htmlFor="fullName" className="text-sm text-foreground">
              {fieldLabels["full-name"]}
              {isFieldRequired("full-name") && (
                <span className="text-destructive">*</span>
              )}
            </Label>
            <Input
              id="fullName"
              placeholder="Enter your full name"
              {...register("fullName", {
                onChange: (e) => handleFieldChange("fullName", e.target.value),
              })}
            />
            {errors.fullName && (
              <p className="text-xs text-destructive">
                {errors.fullName.message}
              </p>
            )}
          </div>
        )}

        {isFieldVisible("date-of-birth") && (
          <div className="space-y-2">
            <Label htmlFor="dateOfBirth" className="text-sm text-foreground">
              {fieldLabels["date-of-birth"]}
              {isFieldRequired("date-of-birth") && (
                <span className="text-destructive">*</span>
              )}
            </Label>
            <Input
              id="dateOfBirth"
              type="date"
              max={maxDate}
              {...register("dateOfBirth", {
                onChange: (e) =>
                  handleFieldChange("dateOfBirth", e.target.value),
              })}
            />
            {errors.dateOfBirth && (
              <p className="text-xs text-destructive">
                {errors.dateOfBirth.message}
              </p>
            )}
          </div>
        )}

        {isFieldVisible("gender") && (
          <div className="space-y-2">
            <Label htmlFor="gender" className="text-sm text-foreground">
              {fieldLabels["gender"]}
              {isFieldRequired("gender") && (
                <span className="text-destructive">*</span>
              )}
            </Label>
            <div className="flex gap-4">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  value="female"
                  {...register("gender")}
                  className="w-4 h-4 accent-primary"
                />
                <span className="text-sm">She/her (Female)</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  value="male"
                  {...register("gender")}
                  className="w-4 h-4 accent-primary"
                  defaultChecked
                />
                <span className="text-sm">He/him (Male)</span>
              </label>
            </div>
            {errors.gender && (
              <p className="text-xs text-destructive">
                {errors.gender.message}
              </p>
            )}
          </div>
        )}

        {isFieldVisible("domicile") && (
          <div className="space-y-2">
            <Label htmlFor="domicile" className="text-sm text-foreground">
              {fieldLabels["domicile"]}
              {isFieldRequired("domicile") && (
                <span className="text-destructive">*</span>
              )}
            </Label>
            <Select
              onValueChange={(value) => handleFieldChange("domicile", value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Choose your domicile" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Jakarta">Jakarta</SelectItem>
                <SelectItem value="Bandung">Bandung</SelectItem>
                <SelectItem value="Surabaya">Surabaya</SelectItem>
                <SelectItem value="Yogyakarta">Yogyakarta</SelectItem>
                <SelectItem value="Semarang">Semarang</SelectItem>
                <SelectItem value="Medan">Medan</SelectItem>
                <SelectItem value="Bali">Bali</SelectItem>
                <SelectItem value="Other">Other</SelectItem>
              </SelectContent>
            </Select>
            {errors.domicile && (
              <p className="text-xs text-destructive">
                {errors.domicile.message}
              </p>
            )}
          </div>
        )}

        {isFieldVisible("phone-number") && (
          <div className="space-y-2">
            <Label htmlFor="phoneNumber" className="text-sm text-foreground">
              {fieldLabels["phone-number"]}
              {isFieldRequired("phone-number") && (
                <span className="text-destructive">*</span>
              )}
            </Label>
            <div className="flex relative">
              <div className="flex items-center gap-2 p-2 bg-accent rounded-md border-r border-border">
                <Image
                  src="https://flagcdn.com/id.svg"
                  alt="Indonesia flag"
                  width={16}
                  height={12}
                />
                <span className="text-sm">+62</span>
              </div>
              <Input
                id="phoneNumber"
                type="number"
                placeholder="81XXXXXXXXX"
                className="flex-1 absolute pl-18 "
                {...register("phoneNumber", {
                  onChange: (e) =>
                    handleFieldChange("phoneNumber", e.target.value),
                })}
              />
            </div>
            {errors.phoneNumber && (
              <p className="text-xs text-destructive">
                {errors.phoneNumber.message}
              </p>
            )}
          </div>
        )}

        {isFieldVisible("email") && (
          <div className="space-y-2">
            <Label htmlFor="email" className="text-sm text-foreground">
              {fieldLabels["email"]}
              {isFieldRequired("email") && (
                <span className="text-destructive">*</span>
              )}
            </Label>
            <Input
              id="email"
              type="email"
              placeholder="Enter your email address"
              {...register("email", {
                onChange: (e) => handleFieldChange("email", e.target.value),
              })}
            />
            {errors.email && (
              <p className="text-xs text-destructive">{errors.email.message}</p>
            )}
          </div>
        )}

        {isFieldVisible("linkedin-link") && (
          <div className="space-y-2">
            <Label htmlFor="linkedinLink" className="text-sm text-foreground">
              {fieldLabels["linkedin-link"]}
              {isFieldRequired("linkedin-link") && (
                <span className="text-destructive">*</span>
              )}
            </Label>
            <Input
              id="linkedinLink"
              type="url"
              placeholder="https://linkedin.com/in/username"
              {...register("linkedinLink", {
                onChange: (e) =>
                  handleFieldChange("linkedinLink", e.target.value),
              })}
            />
            {errors.linkedinLink && (
              <p className="text-xs text-destructive">
                {errors.linkedinLink.message}
              </p>
            )}
          </div>
        )}

        <Button
          type="submit"
          size="lg"
          className="w-full mt-6"
          disabled={loading}
        >
          {loading ? "Submitting..." : "Submit"}
        </Button>
      </form>
    </div>
  );
}
