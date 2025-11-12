import { createClient } from "@/lib/utils/supabase/server";
import { NextResponse } from "next/server";

export async function GET() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { data, error: err } = await supabase
    .from("users")
    .select("email, full_name")
    .eq("auth_id", user.id)
    .maybeSingle();
  if (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
  if (!data) {
    return NextResponse.json(
      {
        error: "User not found",
      },
      { status: 404 }
    );
  }
  return NextResponse.json({
    data: {
      email: data.email,
      full_name: data.full_name,
    },
    error: null,
  });
}
