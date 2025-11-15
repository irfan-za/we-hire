import { jobSchema } from "@/schemas/job";
import { createClient } from "@/lib/utils/supabase/server";
import { formatIDR } from "@/lib/utils";
import { NextRequest, NextResponse } from "next/server";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createClient();
    const { id } = await params;

    const { data, error } = await supabase
      .from("jobs")
      .select(
        "id,title,slug,description,type,started_at,ended_at,status,work_arrangement,location,company,salary_range,config,created_at,updated_at"
      )
      .eq("id", id)
      .single();

    if (error) {
      if (error.code === "PGRST116") {
        return NextResponse.json({ error: "Job not found" }, { status: 404 });
      }
      throw error;
    }

    return NextResponse.json({ data }, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Failed to fetch job",
      },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createClient();
    const { id } = await params;
    const body = await request.json();

    const validatedData = jobSchema.parse(body);

    const updateData: Record<string, unknown> = {
      title: validatedData.title,
      slug: body.slug,
      type: validatedData.type,
      description: validatedData.description,
      started_at: validatedData.startedAt,
      ended_at: validatedData.endedAt,
      config: validatedData.config,
      status: body.status,
      updated_at: new Date().toISOString(),
    };

    if (validatedData.minSalary && validatedData.maxSalary) {
      updateData.salary_range = {
        min: validatedData.minSalary,
        max: validatedData.maxSalary,
        currency: "IDR",
        display_text: `${formatIDR(validatedData.minSalary)} - ${formatIDR(
          validatedData.maxSalary
        )}`,
      };
    }

    const { error } = await supabase
      .from("jobs")
      .update(updateData)
      .eq("id", id);

    if (error) {
      if (error.code === "PGRST116") {
        return NextResponse.json({ error: "Job not found" }, { status: 404 });
      }
      throw error;
    }

    return NextResponse.json(
      {
        message: "Job updated successfully",
      },
      { status: 200 }
    );
  } catch (error) {
    if (error instanceof Error) {
      return NextResponse.json(
        {
          error: error.message,
        },
        { status: 400 }
      );
    }

    return NextResponse.json(
      {
        error: "Failed to update job",
      },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createClient();
    const { id } = await params;

    const { data: existingJob, error: fetchError } = await supabase
      .from("jobs")
      .select("id")
      .eq("id", id)
      .single();

    if (fetchError || !existingJob) {
      return NextResponse.json({ error: "Job not found" }, { status: 404 });
    }

    const { error } = await supabase.from("jobs").delete().eq("id", id);

    if (error) {
      throw error;
    }

    return NextResponse.json(
      {
        message: "Job deleted successfully",
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
