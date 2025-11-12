"use client";
import { Button } from "@/components/ui/button";
import { clearLocalStorageCache } from "@/lib/utils/cache";
import { loginSchema } from "@/schemas/auth";
import { zodResolver } from "@hookform/resolvers/zod";
import { Eye, EyeOff } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

type LoginFormData = z.infer<typeof loginSchema>;

export default function LoginClient() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [passwordVisible, setPasswordVisible] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginFormData) => {
    setLoading(true);

    const res = await fetch(`/api/auth/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email: data.email,
        password: data.password,
      }),
    });
    const { error } = await res.json();
    console.log(error);
    if (!error) {
      await clearLocalStorageCache();
      router.replace("/jobs");
    } else {
      if (error.code === "invalid_credentials") {
        toast.error("Email or Password Incorrect", {
          description: "Please try again",
        });
      } else if (error.code === "email_not_confirmed") {
        toast.error("Email not confirmed", {
          description: "Please check your email for confirmation",
        });
      }
    }
    setLoading(false);
  };

  return (
    <section className="flex h-[calc(100vh-4rem)]  w-full items-center bg-muted py-16">
      <main className="mx-auto w-full max-w-md p-6">
        <div className="mt-7 rounded-xl border border-border bg-accent/40 shadow-sm">
          <div className="p-4 sm:p-7">
            <div className="text-center">
              <h1 className="block text-2xl font-bold text-foreground">
                Sign In
              </h1>
              <p className="mt-2 text-sm text-accent-foreground">
                Don&apos;t have an account?{" "}
                <Link
                  className="font-medium text-primary decoration-2 hover:underline"
                  href="/auth/register"
                >
                  Register here.
                </Link>
              </p>
            </div>

            <div className="mt-5">
              <form onSubmit={handleSubmit(onSubmit)}>
                <div className="grid gap-y-4">
                  <div>
                    <label
                      htmlFor="email"
                      className="mb-2 block text-sm text-accent-foreground"
                    >
                      Email
                    </label>
                    <div className="relative">
                      <input
                        type="email"
                        id="email"
                        {...register("email")}
                        className="block w-full rounded-lg border border-border px-4 py-3 text-sm focus:border-primary focus:ring-primary disabled:pointer-events-none disabled:opacity-50 bg-accent"
                        aria-describedby="email-error"
                      />
                    </div>
                    {errors.email && (
                      <p
                        className="mt-2 text-xs text-destructive"
                        id="email-error"
                      >
                        {errors.email.message}
                      </p>
                    )}
                  </div>

                  <div>
                    <div className="flex items-center justify-between">
                      <label
                        htmlFor="password"
                        className="mb-2 block text-sm text-accent-foreground"
                      >
                        Password
                      </label>
                    </div>
                    <div className="relative">
                      <input
                        type={passwordVisible ? "text" : "password"}
                        id="password"
                        {...register("password")}
                        className="block w-full rounded-lg border border-border px-4 py-3 text-sm focus:border-primary focus:ring-primary disabled:pointer-events-none disabled:opacity-50 bg-accent"
                        aria-describedby="password-error"
                      />
                      <button
                        type="button"
                        className="absolute right-2 top-[50%] h-5 w-5 -translate-y-[50%] text-accent-foreground"
                        onClick={() => setPasswordVisible(!passwordVisible)}
                      >
                        {passwordVisible ? (
                          <Eye className="h-5 w-5" />
                        ) : (
                          <EyeOff className="h-5 w-5" />
                        )}
                      </button>
                    </div>
                    {errors.password && (
                      <p
                        className="mt-2 text-xs text-destructive"
                        id="password-error"
                      >
                        {errors.password.message}
                      </p>
                    )}
                  </div>

                  <Button disabled={loading} className="font-medium">
                    {loading ? "Signing in..." : "Sign In"}
                  </Button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </main>
    </section>
  );
}
