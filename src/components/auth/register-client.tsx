"use client";
import { Button } from "@/components/ui/button";
import { clearLocalStorageCache } from "@/lib/utils/cache";
import { registerSchema } from "@/schemas/auth";
import { zodResolver } from "@hookform/resolvers/zod";
import { Eye, EyeOff } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

type RegisterFormData = z.infer<typeof registerSchema>;

export default function RegisterClient() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [confirmPasswordVisible, setConfirmPasswordVisible] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
  });

  const onSubmit = async (data: RegisterFormData) => {
    setLoading(true);
    clearLocalStorageCache();

    const res = await fetch(`/api/auth/register`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        full_name: data.full_name,
        email: data.email,
        password: data.password,
      }),
    });
    const { error } = await res.json();
    if (!error) {
      toast.success("Registration Successful", {
        description: "Please check your email to confirm your account",
      });
      router.push("/auth/login");
    } else {
      if (error.code === "user_already_exists") {
        toast.error("Email already exists", {
          description: "Please try with a different email",
        });
      } else {
        toast.error("Registration Failed", {
          description: error.message || "Please try again",
        });
      }
    }
    setLoading(false);
  };

  return (
    <section className="flex h-[calc(100vh-4rem)] w-full items-center bg-muted py-16">
      <main className="mx-auto w-full max-w-md p-6 md:p-3">
        <div className="mt-7 rounded-xl border border-border bg-accent/40 shadow-sm">
          <div className="p-4 sm:p-7">
            <div className="text-center">
              <h1 className="block text-2xl font-bold text-foreground">
                Sign Up
              </h1>
              <p className="mt-2 text-sm text-accent-foreground">
                Already have an account?{" "}
                <Link
                  className="font-medium text-primary decoration-2 hover:underline"
                  href="/auth/login"
                >
                  Sign in here.
                </Link>
              </p>
            </div>

            <div className="mt-5">
              <form onSubmit={handleSubmit(onSubmit)}>
                <div className="grid gap-y-4">
                  <div>
                    <label
                      htmlFor="full_name"
                      className="mb-2 block text-sm text-accent-foreground"
                    >
                      Full Name
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        id="full_name"
                        {...register("full_name")}
                        className="block w-full rounded-lg border border-border px-3 py-1 text-sm focus:border-primary focus:ring-primary disabled:pointer-events-none disabled:opacity-50 bg-accent"
                        aria-describedby="full_name-error"
                      />
                    </div>
                    {errors.full_name && (
                      <p
                        className="mt-2 text-xs text-destructive"
                        id="full_name-error"
                      >
                        {errors.full_name.message}
                      </p>
                    )}
                  </div>

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
                        className="block w-full rounded-lg border border-border px-3 py-1 text-sm focus:border-primary focus:ring-primary disabled:pointer-events-none disabled:opacity-50 bg-accent"
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
                    <label
                      htmlFor="password"
                      className="mb-2 block text-sm text-accent-foreground"
                    >
                      Password
                    </label>
                    <div className="relative">
                      <input
                        type={passwordVisible ? "text" : "password"}
                        id="password"
                        {...register("password")}
                        className="block w-full rounded-lg border border-border px-3 py-1 text-sm focus:border-primary focus:ring-primary disabled:pointer-events-none disabled:opacity-50 bg-accent"
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

                  <div>
                    <label
                      htmlFor="confirmPassword"
                      className="mb-2 block text-sm text-accent-foreground"
                    >
                      Confirm Password
                    </label>
                    <div className="relative">
                      <input
                        type={confirmPasswordVisible ? "text" : "password"}
                        id="confirmPassword"
                        {...register("confirmPassword")}
                        className="block w-full rounded-lg border border-border px-3 py-1 text-sm focus:border-primary focus:ring-primary disabled:pointer-events-none disabled:opacity-50 bg-accent"
                        aria-describedby="confirmPassword-error"
                      />
                      <button
                        type="button"
                        className="absolute right-2 top-[50%] h-5 w-5 -translate-y-[50%] text-accent-foreground"
                        onClick={() =>
                          setConfirmPasswordVisible(!confirmPasswordVisible)
                        }
                      >
                        {confirmPasswordVisible ? (
                          <Eye className="h-5 w-5" />
                        ) : (
                          <EyeOff className="h-5 w-5" />
                        )}
                      </button>
                    </div>
                    {errors.confirmPassword && (
                      <p
                        className="mt-2 text-xs text-destructive"
                        id="confirmPassword-error"
                      >
                        {errors.confirmPassword.message}
                      </p>
                    )}
                  </div>

                  <Button disabled={loading} className="font-medium">
                    {loading ? "Creating account..." : "Sign Up"}
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
