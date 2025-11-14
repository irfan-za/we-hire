import { jobSchema } from "@/schemas/job";
import { createClient } from "@/lib/utils/supabase/server";
import { formatIDR } from "@/lib/utils";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { searchParams } = new URL(request.url);

    const searchQuery = searchParams.get("q");
    const status = searchParams.get("status");
    const type = searchParams.get("type");
    const location = searchParams.get("location");
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");

    const offset = (page - 1) * limit;

    let query = supabase
      .from("jobs")
      .select(
        "id,title,slug,description,type,started_at,ended_at,status,work_arrangement,location,company,salary_range,config",
        { count: "exact" }
      );

    if (searchQuery && searchQuery.trim()) {
      query = query.or(
        `title.ilike.%${searchQuery.trim()}%,description.ilike.%${searchQuery.trim()}%`
      );
    }

    if (status) {
      const statuses = status.split(",");
      query = query.in("status", statuses);
    }

    if (type) {
      const types = type.split(",");
      query = query.in("type", types);
    }

    if (location) {
      query = query.or(`location.ilike.%${location}%`);
    }

    const { data, error, count } = await query
      .order("created_at", { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) {
      throw error;
    }

    const totalPages = Math.ceil((count || 0) / limit);

    return NextResponse.json(
      {
        data: data || [],
        pagination: {
          page,
          limit,
          total: count || 0,
          totalPages,
        },
      },
      { status: 200 }
    );
  } catch (error) {
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Failed to fetch jobs",
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validatedData = jobSchema.parse(body);
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
            display_text: `${formatIDR(validatedData.minSalary)} - ${formatIDR(
              validatedData.maxSalary
            )}`,
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
          error: error.message,
        },
        { status: 400 }
      );
    }

    return NextResponse.json(
      {
        error: "Failed to create job",
      },
      { status: 500 }
    );
  }
}
