import { createClient } from "@/lib/utils/supabase/server";
import { NextResponse } from "next/server";

export async function GET() {
  const supabase = await createClient();

  const { error } = await supabase.auth.signOut();
  if (error) {
    return NextResponse.json({
      error,
    });
  }
  return NextResponse.json({
    success: true,
  });
}
