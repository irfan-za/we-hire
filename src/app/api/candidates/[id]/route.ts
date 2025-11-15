import { createClient } from "@/lib/utils/supabase/server";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {}
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createClient();
    const { id } = await params;

    const { data: existingCandidate, error: fetchError } = await supabase
      .from("candidates")
      .select("id")
      .eq("id", id)
      .single();

    if (fetchError || !existingCandidate) {
      return NextResponse.json(
        { error: "Candidate not found" },
        { status: 404 }
      );
    }

    const { error } = await supabase.from("candidates").delete().eq("id", id);
    if (error) {
      throw error;
    }

    return NextResponse.json(
      {
        message: "Candidate deleted successfully",
      },
      { status: 200 }
    );
  } catch (error) {
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Failed to delete job",
      },
      { status: 500 }
    );
  }
}
