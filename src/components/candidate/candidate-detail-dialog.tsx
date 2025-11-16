"use client";

import { Candidate } from "@/hooks/use-candidates";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { formatDate } from "@/lib/utils";
import { Calendar, Mail, MapPin, Phone, Linkedin, Venus } from "lucide-react";

interface CandidateDetailDialogProps {
  candidate: Candidate | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function CandidateDetailDialog({
  candidate,
  open,
  onOpenChange,
}: CandidateDetailDialogProps) {
  if (!candidate) return null;

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Candidate Details</DialogTitle>
          <DialogDescription>
            Complete information about the candidate
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          <div className="flex items-center gap-4 pb-4 border-b">
            <Avatar className="h-20 w-20">
              <AvatarImage
                src={candidate.profile_picture || undefined}
                alt={candidate.full_name}
              />
              <AvatarFallback className="text-xl">
                {getInitials(candidate.full_name)}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <h3 className="text-2xl font-semibold">{candidate.full_name}</h3>
              {candidate.gender && (
                <Badge variant="outline" className="mt-2 capitalize">
                  <Venus className="h-3 w-3 mr-1" />
                  {candidate.gender}
                </Badge>
              )}
            </div>
          </div>

          <div className="space-y-3">
            <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
              Contact Information
            </h4>
            <div className="grid gap-3">
              <div className="flex items-center gap-3">
                <div className="flex items-center justify-center h-9 w-9 rounded-md bg-muted">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Email</p>
                  <p className="text-sm font-medium">{candidate.email}</p>
                </div>
              </div>

              {candidate.phone && (
                <div className="flex items-center gap-3">
                  <div className="flex items-center justify-center h-9 w-9 rounded-md bg-muted">
                    <Phone className="h-4 w-4 text-muted-foreground" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Phone</p>
                    <p className="text-sm font-medium">{candidate.phone}</p>
                  </div>
                </div>
              )}

              {candidate.linkedin_link && (
                <div className="flex items-center gap-3">
                  <div className="flex items-center justify-center h-9 w-9 rounded-md bg-muted">
                    <Linkedin className="h-4 w-4 text-muted-foreground" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-muted-foreground">LinkedIn</p>
                    <a
                      href={candidate.linkedin_link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm font-medium text-blue-600 hover:underline truncate block"
                    >
                      {candidate.linkedin_link}
                    </a>
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="space-y-3">
            <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
              Personal Information
            </h4>
            <div className="grid gap-3">
              {candidate.date_of_birth && (
                <div className="flex items-center gap-3">
                  <div className="flex items-center justify-center h-9 w-9 rounded-md bg-muted">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">
                      Date of Birth
                    </p>
                    <p className="text-sm font-medium">
                      {formatDate(candidate.date_of_birth)}
                    </p>
                  </div>
                </div>
              )}

              {candidate.domicile && (
                <div className="flex items-center gap-3">
                  <div className="flex items-center justify-center h-9 w-9 rounded-md bg-muted">
                    <MapPin className="h-4 w-4 text-muted-foreground" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Domicile</p>
                    <p className="text-sm font-medium">{candidate.domicile}</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="pt-4 border-t">
            <p className="text-xs text-muted-foreground">
              Applied on{" "}
              {new Date(candidate.created_at).toLocaleDateString("en-US", {
                year: "numeric",
                month: "long",
                day: "numeric",
                hour: "2-digit",
                minute: "2-digit",
              })}
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
