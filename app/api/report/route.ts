import { NextResponse } from "next/server";
import { supabase } from "@/lib/db";

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const {
      user_id,        
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

    // Determine corrected label automatically
    let corrected_label = null;

    if (user_feedback === "legit") {
      corrected_label = "not_scam";
    } else if (user_feedback === "scam") {
      corrected_label = "scam";
    }

    let model_mistake = false;

    if (corrected_label === "not_scam" && risk_score >= 50) {
        model_mistake = true;
    }

    if (corrected_label === "scam" && risk_score < 50) {
        model_mistake = true;
    }

    if (!content) {
    return NextResponse.json(
        { error: "Content is required" },
        { status: 400 }
    );
    }

    const { data, error } = await supabase
      .from("reports")
      .insert([
        {
          user_id,   
          content,
          content_type,
          platform,
          region,
          risk_score,
          risk_level,
          model_name,
          model_version,
          user_feedback,
          corrected_label, 
          model_mistake
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