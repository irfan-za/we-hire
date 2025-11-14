import { createClient } from "@/lib/utils/supabase/server";
import { NextRequest, NextResponse } from "next/server";
import { candidateSchema } from "@/schemas/candidate";

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { searchParams } = new URL(request.url);

    const jobId = searchParams.get("job_id");
    const gender = searchParams.get("gender");
    const sortBy = searchParams.get("sort_by") || "created_at";
    const sortOrder = searchParams.get("sort_order") || "desc";
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");

    if (!jobId) {
      return NextResponse.json(
        { error: "job_id is required" },
        { status: 400 }
      );
    }

    const offset = (page - 1) * limit;

    let query = supabase
      .from("candidates")
      .select(
        "id,full_name,email,phone,date_of_birth,domicile,gender,linkedin_link",
        { count: "exact" }
      )
      .eq("job_id", jobId);

    if (gender) {
      query = query.eq("gender", gender);
    }

    const { data, error, count } = await query
      .order(sortBy, { ascending: sortOrder === "asc" })
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
        error:
          error instanceof Error ? error.message : "Failed to fetch candidates",
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const body = await request.json();

    const validatedData = candidateSchema.parse(body);

    const candidateData = {
      job_id: body.jobId,
      full_name: validatedData.fullName,
      profile_picture: validatedData.profilePicture || null,
      gender: validatedData.gender,
      domicile: validatedData.domicile,
      email: validatedData.email,
      phone: validatedData.phoneNumber,
      linkedin_link: validatedData.linkedinLink,
      date_of_birth: validatedData.dateOfBirth,
    };

    const { error } = await supabase.from("candidates").insert(candidateData);

    if (error) {
      throw error;
    }

    return NextResponse.json(
      {
        message: "Application submitted successfully",
      },
      { status: 201 }
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
        error: "Failed to submit application",
      },
      { status: 500 }
    );
  }
}
