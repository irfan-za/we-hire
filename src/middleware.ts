import { NextRequest, NextResponse } from "next/server";
import { createClient } from "./lib/utils/supabase/server";

export async function middleware(req: NextRequest) {
  const supabaseMiddleware = await createClient();
  const nextUrl = req.nextUrl;
  const pathname = nextUrl.pathname;

  const {
    data: { user },
  } = await supabaseMiddleware.auth.getUser();
  if (!user && pathname.startsWith("/jobs")) {
    const url = new URL(`/auth/login`, req.url);
    return NextResponse.redirect(url.href);
  }
  return NextResponse.next();
}

export const config = {
  matcher: ["/auth/:path*", "/jobs/:path*"],
};
