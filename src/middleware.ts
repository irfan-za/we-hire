import { NextRequest, NextResponse } from "next/server";
import { createClient } from "./lib/utils/supabase/server";

export async function middleware(req: NextRequest) {
  const supabaseMiddleware = await createClient();
  const nextUrl = req.nextUrl;
  const pathname = nextUrl.pathname;

  const {
    data: { user },
  } = await supabaseMiddleware.auth.getUser();
  const { data: currentUser } = await supabaseMiddleware
    .from("users")
    .select("role")
    .single();
  if (
    (!user || !currentUser) &&
    (pathname.startsWith("/admin") || pathname.startsWith("/apply-job"))
  ) {
    const url = new URL(`/auth/login`, req.url);
    return NextResponse.redirect(url.href);
  } else if (user && pathname.startsWith("/auth")) {
    const url = new URL(`/jobs`, req.url);
    return NextResponse.redirect(url.href);
  }

  if (currentUser?.role !== "admin" && pathname.startsWith("/admin")) {
    const url = new URL(`/jobs`, req.url);
    return NextResponse.redirect(url.href);
  }
  return NextResponse.next();
}

export const config = {
  matcher: [
    "/auth/:path*",
    "/jobs/:path*",
    "/apply-job/:path*",
    "/admin/:path*",
  ],
};
