import { createClient } from "@/lib/utils/supabase/server";
import { NextResponse } from "next/server";

export async function POST(req: Request): Promise<Response> {
  const {
    full_name,
    email,
    password,
  }: { full_name: string; email: string; password: string } = await req.json();
  const url = new URL(req.url);
  const supabase = await createClient();
  const { data, error } = await supabase.auth.signUp({
    email: email,
    password: password,
    options: {
      data: {
        full_name: full_name,
      },
    },
  });

  if (data.user) {
    const { data: users } = await supabase
      .from("users")
      .select("*")
      .eq("email", data.user.email);
    if (users && users.length > 0) {
      return NextResponse.json({
        error: {
          message:
            "Email is already in use, please login or use a different email.",
        },
      });
    } else if (!data.user.user_metadata.email_verified) {
      return NextResponse.json({ success: true });
    }
  }
  return NextResponse.json({ error });
}
