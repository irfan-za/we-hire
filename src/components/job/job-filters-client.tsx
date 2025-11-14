"use client";

import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { useCallback } from "react";

export default function JobFiltersClient() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const selectedType = searchParams.get("type") || "all";
  const selectedLocation = searchParams.get("location") || "all";

  const updateParams = useCallback(
    (updates: Record<string, string | null>) => {
      const params = new URLSearchParams(searchParams.toString());
      Object.entries(updates).forEach(([key, value]) => {
        if (value !== null && value !== undefined) params.set(key, value);
        else params.delete(key);
      });
      router.push(`${pathname}?${params.toString()}`);
    },
    [searchParams, router, pathname]
  );

  const setType = (v: string) =>
    updateParams({ type: v === "all" ? null : v, external_id: null });
  const setLocation = (v: string) =>
    updateParams({ location: v === "all" ? null : v, external_id: null });

  return (
    <div className="w-full px-4 mb-4 flex gap-3">
      <Select value={selectedType} onValueChange={(v) => setType(v)}>
        <SelectTrigger className="md:w-48 h-12">
          <SelectValue placeholder="Job Type" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Types</SelectItem>
          <SelectItem value="full-time">Full Time</SelectItem>
          <SelectItem value="part-time">Part Time</SelectItem>
          <SelectItem value="contract">Contract</SelectItem>
          <SelectItem value="internship">Internship</SelectItem>
        </SelectContent>
      </Select>

      <Select value={selectedLocation} onValueChange={(v) => setLocation(v)}>
        <SelectTrigger className="md:w-48 h-12">
          <SelectValue placeholder="Location" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Locations</SelectItem>
          <SelectItem value="jakarta">Jakarta</SelectItem>
          <SelectItem value="bandung">Bandung</SelectItem>
          <SelectItem value="yogyakarta">Yogyakarta</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
}
