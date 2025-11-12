"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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
import { createJobSchema, CreateJobFormData } from "@/schemas/job";
import { zodResolver } from "@hookform/resolvers/zod";
import { X } from "lucide-react";
import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

interface CreateJobDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

type Config = {
  name: string;
  key: string;
  status: "mandatory" | "optional" | "off";
};

const configFields = [
  { key: "full-name", name: "Full Name" },
  { key: "photo-profile", name: "Photo Profile" },
  { key: "gender", name: "Gender" },
  { key: "domicile", name: "Domicile" },
  { key: "email", name: "Email" },
  { key: "phone-number", name: "Phone Number" },
  { key: "linkedin-link", name: "LinkedIn" },
];

export default function CreateJobDialog({
  open,
  onOpenChange,
}: CreateJobDialogProps) {
  const [loading, setLoading] = useState(false);
  const [config, setConfig] = useState<Config[]>(
    configFields.map((config) => ({
      name: config.name,
      key: config.key,
      status: "mandatory",
    }))
  );
  const mandatoryIndexes = [0, 1, 4];

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
    reset,
  } = useForm<CreateJobFormData>({
    resolver: zodResolver(createJobSchema),
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

  const onSubmit = async (data: CreateJobFormData) => {
    setLoading(true);

    try {
      const slug = generateSlug(data.title);

      const res = await fetch("/api/jobs", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...data,
          slug,
        }),
      });

      const result = await res.json();

      if (!res.ok) {
        throw new Error(result.error || "Failed to create job");
      }

      toast.success("Job Created Successfully", {
        description: "The job opening has been published",
      });

      reset();
      setConfig(
        configFields.map((config) => ({
          name: config.name,
          key: config.key,
          status: "mandatory" as const,
        }))
      );
      onOpenChange(false);
    } catch (error) {
      toast.error("Failed to Create Job", {
        description:
          error instanceof Error ? error.message : "Please try again",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold">
            Job Opening
          </DialogTitle>
          <button
            onClick={() => onOpenChange(false)}
            className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-accent data-[state=open]:text-muted-foreground"
          >
            <X className="h-4 w-4" />
            <span className="sr-only">Close</span>
          </button>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 mt-4">
          <div className="space-y-2">
            <Label htmlFor="title">
              Job Title<span className="text-red-500">*</span>
            </Label>
            <Input
              id="title"
              placeholder="Ex: Front End Engineer"
              {...register("title")}
            />
            {errors.title && (
              <p className="text-xs text-destructive">{errors.title.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="type">
              Job Type<span className="text-red-500">*</span>
            </Label>
            <Select onValueChange={(value) => setValue("type", value)}>
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
              <p className="text-xs text-destructive">{errors.type.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">
              Job Description<span className="text-red-500">*</span>
            </Label>
            <Textarea
              id="description"
              placeholder="Ex..."
              className="min-h-[100px]"
              {...register("description")}
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
                  Started At<span className="text-red-500">*</span>
                </Label>
                <Input id="startedAt" type="date" {...register("startedAt")} />
                {errors.startedAt && (
                  <p className="text-xs text-destructive mt-1">
                    {errors.startedAt.message}
                  </p>
                )}
              </div>
              <div>
                <Label htmlFor="endedAt" className="text-sm">
                  Ended At<span className="text-red-500">*</span>
                </Label>
                <Input id="endedAt" type="date" {...register("endedAt")} />
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
                    {...register("minSalary")}
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
                    {...register("maxSalary")}
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
                  <span className="text-sm">{config.name}</span>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => handleStatusChange(index, "mandatory")}
                      className={`px-3 py-1 text-xs rounded-full border transition-colors ${
                        config.status === "mandatory"
                          ? "bg-primary text-primary-foreground border-primary"
                          : "bg-background border-border hover:bg-accent"
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
                          ? "bg-primary text-primary-foreground border-primary"
                          : "bg-background border-border hover:bg-accent"
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
                          ? "bg-secondary text-secondary-foreground border-secondary"
                          : "bg-background border-border hover:bg-accent"
                      }`}
                    >
                      Off
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="flex justify-end pt-4">
            <Button type="submit" size="lg" className="px-8" disabled={loading}>
              {loading ? "Publishing..." : "Publish Job"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
