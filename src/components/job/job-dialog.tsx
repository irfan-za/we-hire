"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { generateSlug } from "@/lib/utils";
import { jobSchema, JobFormData } from "@/schemas/job";
import { zodResolver } from "@hookform/resolvers/zod";
import { ChevronDown, X } from "lucide-react";
import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { useUpdateJob, useDeleteJob, useCreateJob } from "@/hooks/use-jobs";
import { Config, Job, JobStatus } from "@/types";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";

interface JobDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  job?: Job;
}

const configFields: Config[] = [
  { key: "profile-picture", status: "mandatory" },
  { key: "full-name", status: "mandatory" },
  { key: "date-of-birth", status: "mandatory" },
  { key: "gender", status: "mandatory" },
  { key: "domicile", status: "mandatory" },
  { key: "phone-number", status: "mandatory" },
  { key: "email", status: "mandatory" },
  { key: "linkedin-link", status: "mandatory" },
];

export default function JobDialog({
  open,
  onOpenChange,
  job: existingJob,
}: JobDialogProps) {
  const [loading, setLoading] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [config, setConfig] = useState<Config[]>(configFields);
  let status: JobStatus = existingJob ? existingJob.status : "active";

  const isEditMode = !!existingJob;
  const { mutate: createJob } = useCreateJob();
  const { mutate: updateJob } = useUpdateJob();
  const { mutate: deleteJob, isPending: isDeleting } = useDeleteJob();
  const mandatoryIndexes = [0, 1, 4];

  const minDate = (() => {
    const d = new Date();
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, "0");
    const dd = String(d.getDate()).padStart(2, "0");
    return `${yyyy}-${mm}-${dd}`;
  })();

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
    reset,
  } = useForm<JobFormData>({
    resolver: zodResolver(jobSchema),
    defaultValues: {
      config: config,
    },
  });

  const handleStatusChange = (index: number, status: Config["status"]) => {
    const updated = [...config];
    updated[index].status = status;
    setConfig(updated);
    setValue("config", updated);
  };

  const handleFieldChange = <K extends keyof JobFormData>(
    field: K,
    value: JobFormData[K]
  ) => {
    setValue(field, value as any);
  };

  const handleDelete = () => {
    if (!existingJob) return;

    deleteJob(existingJob.id, {
      onSuccess: () => {
        setShowDeleteDialog(false);
        onOpenChange(false);
      },
    });
  };

  const handlePublish = () => {
    status = "active";
    handleSubmit(onSubmit)();
  };

  const handleSaveAsDraft = () => {
    status = "draft";
    handleSubmit(onSubmit)();
  };

  useEffect(() => {
    if (isEditMode && existingJob && open) {
      const populatedConfig = existingJob.config
        ? configFields.map((field) => {
            const existingField = existingJob.config?.find(
              (c: any) => c.key === field.key
            );
            return {
              key: field.key,
              status: existingField?.status || "mandatory",
            };
          })
        : config;

      setConfig(populatedConfig);

      reset({
        title: existingJob.title,
        type: existingJob.type,
        workArrangement: existingJob.work_arrangement,
        location: existingJob.location,
        company: existingJob.company,
        description: existingJob.description,
        startedAt: existingJob.started_at.split("T")[0],
        endedAt: existingJob.ended_at.split("T")[0],
        minSalary: existingJob.salary_range?.min,
        maxSalary: existingJob.salary_range?.max,
        config: populatedConfig,
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isEditMode, existingJob, open]);

  const onSubmit = async (data: JobFormData) => {
    setLoading(true);

    try {
      const slug = generateSlug(data.title);
      const payload = { ...data, slug, status };

      if (isEditMode && existingJob) {
        updateJob(
          { jobId: existingJob.id, jobData: payload },
          {
            onSuccess: () => {
              reset();
              setConfig(configFields);
              onOpenChange(false);
            },
          }
        );
      } else {
        createJob(payload, {
          onSuccess: () => {
            reset();
            setConfig(configFields);
            onOpenChange(false);
          },
        });
      }
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : isEditMode
          ? "Failed to Update Job"
          : "Failed to Create Job"
      );
    } finally {
      setTimeout(() => {
        setLoading(false);
      }, 1000);
    }
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-xl font-semibold">
              {isEditMode ? "Edit Job Opening" : "Create Job Opening"}
            </DialogTitle>
            <button
              onClick={() => onOpenChange(false)}
              className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-accent data-[state=open]:text-muted-foreground"
            >
              <X className="h-4 w-4" />
              <span className="sr-only">Close</span>
            </button>
          </DialogHeader>

          <form className="space-y-4 mt-4">
            <div className="space-y-2">
              <Label htmlFor="title">
                Job Title<span className="text-destructive">*</span>
              </Label>
              <Input
                id="title"
                placeholder="Ex: Front End Engineer"
                {...register("title", {
                  onChange: (e) => handleFieldChange("title", e.target.value),
                })}
              />
              {errors.title && (
                <p className="text-xs text-destructive">
                  {errors.title.message}
                </p>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="type">
                  Job Type<span className="text-destructive">*</span>
                </Label>
                <Select
                  onValueChange={(value) => handleFieldChange("type", value)}
                  value={existingJob?.type}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select job type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="full-time">Full Time</SelectItem>
                    <SelectItem value="part-time">Part Time</SelectItem>
                    <SelectItem value="contract">Contract</SelectItem>
                    <SelectItem value="internship">Internship</SelectItem>
                  </SelectContent>
                </Select>
                {errors.type && (
                  <p className="text-xs text-destructive">
                    {errors.type.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="workArrangement">
                  Work Arrangement<span className="text-destructive">*</span>
                </Label>
                <Select
                  onValueChange={(value) =>
                    handleFieldChange("workArrangement", value)
                  }
                  value={existingJob?.work_arrangement}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select arrangement" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="onsite">Onsite</SelectItem>
                    <SelectItem value="remote">Remote</SelectItem>
                    <SelectItem value="hybrid">Hybrid</SelectItem>
                  </SelectContent>
                </Select>
                {errors.workArrangement && (
                  <p className="text-xs text-destructive">
                    {errors.workArrangement.message}
                  </p>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="location">
                Location<span className="text-destructive">*</span>
              </Label>
              <Input
                id="location"
                placeholder="Ex: Kota Jakarta Selatan - DKI Jakarta"
                {...register("location", {
                  onChange: (e) =>
                    handleFieldChange("location", e.target.value),
                })}
              />
              {errors.location && (
                <p className="text-xs text-destructive">
                  {errors.location.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="company">
                Company<span className="text-destructive">*</span>
              </Label>
              <Input
                id="company"
                placeholder="Ex: PT. Mencari"
                {...register("company", {
                  onChange: (e) => handleFieldChange("company", e.target.value),
                })}
              />
              {errors.company && (
                <p className="text-xs text-destructive">
                  {errors.company.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">
                Job Description<span className="text-destructive">*</span>
              </Label>
              <Textarea
                id="description"
                placeholder="Write the job description here..."
                className="min-h-[100px]"
                {...register("description", {
                  onChange: (e) =>
                    handleFieldChange("description", e.target.value),
                })}
              />
              {errors.description && (
                <p className="text-xs text-destructive">
                  {errors.description.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label>Application Period</Label>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="startedAt" className="text-sm">
                    Started At<span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="startedAt"
                    type="date"
                    min={minDate}
                    {...register("startedAt", {
                      onChange: (e) =>
                        handleFieldChange("startedAt", e.target.value),
                    })}
                  />
                  {errors.startedAt && (
                    <p className="text-xs text-destructive mt-1">
                      {errors.startedAt.message}
                    </p>
                  )}
                </div>
                <div>
                  <Label htmlFor="endedAt" className="text-sm">
                    Ended At<span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="endedAt"
                    type="date"
                    min={minDate}
                    {...register("endedAt", {
                      onChange: (e) =>
                        handleFieldChange("endedAt", e.target.value),
                    })}
                  />
                  {errors.endedAt && (
                    <p className="text-xs text-destructive mt-1">
                      {errors.endedAt.message}
                    </p>
                  )}
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Job Salary</Label>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label
                    htmlFor="minSalary"
                    className="text-xs text-muted-foreground"
                  >
                    Minimum Estimated Salary
                  </Label>
                  <div className="flex items-center gap-2 relative">
                    <span className="text-sm absolute left-2">Rp</span>
                    <Input
                      id="minSalary"
                      type="number"
                      placeholder="7,000,000"
                      className="pl-8"
                      {...register("minSalary", {
                        onChange: (e) =>
                          handleFieldChange("minSalary", e.target.value),
                      })}
                    />
                  </div>
                </div>
                <div>
                  <Label
                    htmlFor="maxSalary"
                    className="text-xs text-muted-foreground"
                  >
                    Maximum Estimated Salary
                  </Label>
                  <div className="flex items-center gap-2 relative">
                    <span className="text-sm absolute left-2">Rp</span>
                    <Input
                      id="maxSalary"
                      type="number"
                      className="pl-8"
                      placeholder="8,000,000"
                      {...register("maxSalary", {
                        onChange: (e) =>
                          handleFieldChange("maxSalary", e.target.value),
                      })}
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <Label className="text-base font-semibold">
                Minimum Profile Information Required
              </Label>
              <div className="space-y-2">
                {config.map((config, index) => (
                  <div
                    key={config.key}
                    className="flex items-center justify-between py-2"
                  >
                    <span className="text-sm capitalize">
                      {config.key.split("-").join(" ")}
                    </span>
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => handleStatusChange(index, "mandatory")}
                        className={`px-3 py-1 text-xs rounded-full border transition-colors ${
                          config.status === "mandatory"
                            ? "text-primary border-primary"
                            : "bg-background border-border hover:bg-primary/10"
                        }`}
                      >
                        Mandatory
                      </button>
                      <button
                        type="button"
                        disabled={mandatoryIndexes.includes(index)}
                        onClick={() => handleStatusChange(index, "optional")}
                        className={`px-3 py-1 text-xs rounded-full border transition-colors disabled:bg-muted ${
                          config.status === "optional"
                            ? "text-primary border-primary"
                            : "bg-background border-border hover:bg-primary/10"
                        }`}
                      >
                        Optional
                      </button>
                      <button
                        type="button"
                        disabled={mandatoryIndexes.includes(index)}
                        onClick={() => handleStatusChange(index, "off")}
                        className={`px-3 py-1 text-xs rounded-full border transition-colors disabled:bg-muted ${
                          config.status === "off"
                            ? "text-secondary border-secondary"
                            : "bg-background border-border hover:bg-primary/10"
                        }`}
                      >
                        Off
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex justify-between pt-4">
              {isEditMode && (
                <Button
                  type="button"
                  size="lg"
                  variant="destructive"
                  className="px-8"
                  disabled={loading || isDeleting}
                  onClick={() => setShowDeleteDialog(true)}
                >
                  Delete Job
                </Button>
              )}
              <div className="flex items-center ml-auto">
                <Button
                  type="button"
                  size="sm"
                  className="rounded-r-none border-none"
                  disabled={loading || isDeleting}
                  onClick={handlePublish}
                >
                  {loading
                    ? "Please wait"
                    : isEditMode
                    ? "Update Job"
                    : "Publish Job"}
                </Button>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      size="sm"
                      className="rounded-l-none"
                      variant="outline"
                    >
                      <ChevronDown className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={handleSaveAsDraft}>
                      {loading ? "Saving..." : "Save as Draft"}
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the job
              posting &ldquo;{existingJob?.title}&rdquo; and all associated
              data.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={isDeleting}
              className="bg-destructive text-primary-foreground hover:bg-destructive/90"
            >
              {isDeleting ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
