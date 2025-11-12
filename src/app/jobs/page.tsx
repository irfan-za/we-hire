"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import CreateJobDialog from "@/components/jobs/create-job-dialog";
import { Search } from "lucide-react";
import Image from "next/image";
import React, { useState } from "react";

export default function JobsPage() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  return (
    <div className="min-h-[calc(100vh-4rem)] grid grid-cols-10 p-3 gap-3">
      <div className="col-span-7 flex flex-col items-center justify-center">
        <div className="w-full max-w-2xl px-4 mb-8">
          <div className="relative">
            <Input
              type="text"
              placeholder="Search by job details"
              className="pr-10 h-12"
            />
            <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-primary" />
          </div>
        </div>
        <div className="flex flex-col items-center text-center space-y-6 max-w-md p-8">
          <div className="relative w-48 h-48">
            <Image
              src="/images/not-found.svg"
              alt="No job openings available"
              fill
              className="object-contain"
            />
          </div>
          <div className="space-y-1">
            <h2 className="text-xl font-bold">No job openings available</h2>
            <p className="text-muted-foreground text-sm">
              Create a job opening now and start the candidate process.
            </p>
          </div>
          <Button
            className="cursor-pointer px-8 bg-secondary hover:bg-secondary"
            onClick={() => setIsDialogOpen(true)}
          >
            Create a new job
          </Button>
        </div>
        <CreateJobDialog open={isDialogOpen} onOpenChange={setIsDialogOpen} />
      </div>
      <div className="col-span-3">
        <div className="flex flex-col rounded-lg relative h-36 p-2">
          <div className="absolute inset-0 bg-black/50 rounded-lg -z-10"></div>
          <Image
            src={"/images/bg-menu.jpg"}
            alt="bg menu"
            fill
            className="object-cover -z-20 rounded-lg"
          />
          <div>
            <h3 className="text-primary-foreground text-center text-xl font-semibold">
              Recruit the best candidates
            </h3>
            <p className="text-primary-foreground text-center text-sm font-medium">
              Create jobs, invite, and hire with ease
            </p>
          </div>
          <Button
            className="cursor-pointer w-fit px-12 mt-6 mx-auto"
            onClick={() => setIsDialogOpen(true)}
          >
            Create a new job
          </Button>
        </div>
      </div>
    </div>
  );
}
