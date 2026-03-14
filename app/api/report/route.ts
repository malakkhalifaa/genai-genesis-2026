import { NextResponse } from "next/server";
import { supabase } from "@/lib/db";

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const {
      content,
      content_type,
      platform,
      region,
      risk_score,
      risk_level,
      model_name,
      model_version,
      user_feedback
    } = body;

    // Determine corrected label automatically, UPDATE THIS BASED ON FRONT-END MESSAGE
    let corrected_label = null;

    if (user_feedback === "legit") {
      corrected_label = "not_scam";
    } else if (user_feedback === "scam") {
      corrected_label = "scam";
    }
    

    const { data, error } = await supabase
      .from("reports")
      .insert([
        {
          content,
          content_type,
          platform,
          region,
          risk_score,
          risk_level,
          model_name,
          model_version,
          user_feedback,
          corrected_label
        }
      ]);

    if (error) {
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      message: "Report stored successfully",
      data
    });

  } catch (err) {
    return NextResponse.json(
      { error: "Invalid request" },
      { status: 400 }
    );
  }
}