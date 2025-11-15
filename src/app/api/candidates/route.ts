import { createClient } from "@/lib/utils/supabase/server";
import { NextRequest, NextResponse } from "next/server";

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
        "id,full_name,profile_picture,email,phone,date_of_birth,domicile,gender,linkedin_link,created_at",
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
    const formData = await request.formData();

    const jobId = formData.get("jobId") as string;
    const fullName = formData.get("fullName") as string;
    const gender = formData.get("gender") as string;
    const domicile = formData.get("domicile") as string;
    const email = formData.get("email") as string;
    const phoneNumber = formData.get("phoneNumber") as string;
    const linkedinLink = formData.get("linkedinLink") as string;
    const dateOfBirth = formData.get("dateOfBirth") as string;
    const profilePictureFile = formData.get("profilePicture") as File | null;

    let profilePictureUrl: string | null = null;

    if (profilePictureFile) {
      const timestamp = Date.now();
      const fileName = `${jobId}/${timestamp}_${profilePictureFile.name}`;
      const filePath = `candidates/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from("images")
        .upload(filePath, profilePictureFile, {
          cacheControl: "3600",
          upsert: false,
        });

      if (uploadError) {
        throw new Error(
          `Failed to upload profile picture: ${uploadError.message}`
        );
      }

      const { data: urlData } = supabase.storage
        .from("images")
        .getPublicUrl(filePath);

      profilePictureUrl = urlData.publicUrl;
    }

    const candidateData = {
      job_id: jobId,
      full_name: fullName,
      profile_picture: profilePictureUrl,
      gender: gender as "male" | "female",
      domicile: domicile,
      email: email,
      phone: phoneNumber,
      linkedin_link: linkedinLink,
      date_of_birth: dateOfBirth,
    };

    const { error } = await supabase.from("candidates").insert(candidateData);

    if (error) {
      throw error;
    }

    return NextResponse.json(
      {
        message: "Application submitted successfully",
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
        error: "Failed to submit application",
      },
      { status: 500 }
    );
  }
}
