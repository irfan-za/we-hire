import JobsList from "@/components/job/job-list";
import React, { Suspense } from "react";

export default async function AdminPage() {
  return (
    <Suspense>
      <JobsList />
    </Suspense>
  );
}
