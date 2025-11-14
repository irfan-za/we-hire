import { createClient } from "@/lib/utils/supabase/server";
import { NextResponse } from "next/server";

export async function POST(req: Request): Promise<Response> {
  const { email, password }: { email: string; password: string } =
    await req.json();
  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });
  return NextResponse.json({ error }, { status: error?.status });
}
