import RegisterClient from "@/components/auth/register-client";
import { Suspense } from "react";

export default function Register() {
  return (
    <Suspense
      fallback={
        <div className="rounded-xl border border-border bg-accent shadow-sm">
          <div className="w-[90%] h-8 bg-muted animate-pulse"></div>
          <div className="w-[90%] h-24 bg-muted animate-pulse"></div>
          <div className="w-[90%] h-8 bg-muted animate-pulse"></div>
        </div>
      }
    >
      <RegisterClient />
    </Suspense>
  );
}
