import LoginClient from "@/components/auth/login-client";
import { Suspense } from "react";

function Login() {
  return (
    <div className="h-dvh">
      <Suspense
        fallback={
          <div className="rounded-xl border border-border bg-accent shadow-sm">
            <div className="w-[90%] h-8 bg-muted animate-pulse"></div>
            <div className="w-[90%] h-24 bg-muted animate-pulse"></div>
            <div className="w-[90%] h-8 bg-muted animate-pulse"></div>
          </div>
        }
      >
        <LoginClient />
      </Suspense>
    </div>
  );
}

export default Login;
