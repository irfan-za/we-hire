"use client";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Checkbox } from "@/components/ui/checkbox";
import { useCandidates } from "@/hooks/use-candidates";
import { LoaderCircle } from "lucide-react";
import { useState } from "react";
import Link from "next/link";
import { formatDate } from "@/lib/utils";

interface CandidatesTableProps {
  jobId: string;
  jobTitle: string;
}

export default function CandidatesTable({
  jobId,
  jobTitle,
}: CandidatesTableProps) {
  const { data, isLoading, error } = useCandidates(jobId);
  const [selectedCandidates, setSelectedCandidates] = useState<string[]>([]);

  const candidates = data?.data || [];

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedCandidates(candidates.map((c) => c.id));
    } else {
      setSelectedCandidates([]);
    }
  };

  const handleSelectCandidate = (candidateId: string, checked: boolean) => {
    if (checked) {
      setSelectedCandidates([...selectedCandidates, candidateId]);
    } else {
      setSelectedCandidates(
        selectedCandidates.filter((id) => id !== candidateId)
      );
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-12 space-y-4">
        <LoaderCircle className="animate-spin h-12 w-12" />
        <p className="text-muted-foreground">Loading candidates...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-12 space-y-4">
        <p className="text-destructive">Failed to load candidates</p>
        <p className="text-sm text-muted-foreground">{error.message}</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
            <Link href="/admin" className="hover:text-foreground">
              Job list
            </Link>
            <span>/</span>
            <span className="text-foreground">Manage Candidate</span>
          </div>
          <h1 className="text-2xl font-semibold">{jobTitle}</h1>
        </div>
      </div>

      <div className="border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-12">
                <Checkbox
                  checked={
                    candidates.length > 0 &&
                    selectedCandidates.length === candidates.length
                  }
                  onCheckedChange={handleSelectAll}
                />
              </TableHead>
              <TableHead>NAMA LENGKAP</TableHead>
              <TableHead>EMAIL ADDRESS</TableHead>
              <TableHead>PHONE NUMBERS</TableHead>
              <TableHead>DATE OF BIRTH</TableHead>
              <TableHead>DOMICILE</TableHead>
              <TableHead>GENDER</TableHead>
              <TableHead>LINK LINKEDIN</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {candidates.length > 0 &&
              candidates.map((candidate) => (
                <TableRow key={candidate.id}>
                  <TableCell>
                    <Checkbox
                      checked={selectedCandidates.includes(candidate.id)}
                      onCheckedChange={(checked) =>
                        handleSelectCandidate(candidate.id, checked as boolean)
                      }
                    />
                  </TableCell>
                  <TableCell className="font-medium">
                    {candidate.full_name}
                  </TableCell>
                  <TableCell>{candidate.email}</TableCell>
                  <TableCell>{candidate.phone ?? "-"}</TableCell>
                  <TableCell>
                    {formatDate(candidate.date_of_birth) ?? "-"}
                  </TableCell>
                  <TableCell>{candidate.domicile ?? "-"}</TableCell>
                  <TableCell className="capitalize">
                    {candidate.gender ?? "-"}
                  </TableCell>
                  <TableCell>
                    {candidate.linkedin_url ? (
                      <Link
                        href={candidate.linkedin_url}
                        target="_blank"
                        className="text-blue-600 hover:underline truncate block max-w-[200px]"
                      >
                        {candidate.linkedin_url}
                      </Link>
                    ) : (
                      <span className="text-muted-foreground">-</span>
                    )}
                  </TableCell>
                </TableRow>
              ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
