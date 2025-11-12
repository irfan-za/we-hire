import { createJobSchema } from "@/schemas/job";
import { createClient } from "@/lib/utils/supabase/server";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validatedData = createJobSchema.parse(body);
    const requestData = {
      title: validatedData.title,
      slug: body.slug,
      type: validatedData.type,
      description: validatedData.description,
      started_at: validatedData.startedAt,
      ended_at: validatedData.endedAt,
      ...(validatedData.minSalary &&
        validatedData.maxSalary && {
          salary_range: {
            min: validatedData.minSalary,
            max: validatedData.maxSalary,
            currency: "IDR",
            display_text: `Rp ${validatedData.minSalary} - Rp ${validatedData.maxSalary}`,
          },
        }),
      config: validatedData.config,
    };

    const supabase = await createClient();
    const { error } = await supabase.from("jobs").insert(requestData);

    if (error) {
      throw error;
    }

    return NextResponse.json(
      {
        message: "Job created successfully",
      },
      { status: 200 }
    );
  } catch (error) {
    if (error instanceof Error) {
      return NextResponse.json(
        {
          success: false,
          error: error.message,
        },
        { status: 400 }
      );
    }

    return NextResponse.json(
      {
        success: false,
        error: "Failed to create job",
      },
      { status: 500 }
    );
  }
}
