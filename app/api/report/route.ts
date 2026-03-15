import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export async function POST(req: Request) {
  try {
    const body = await req.json();
    console.log("REPORT BODY:", body);

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

    if (!user_id) {
      return NextResponse.json(
        { error: "Missing user_id" },
        { status: 400 }
      );
    }

    if (!content) {
      return NextResponse.json(
        { error: "Content is required" },
        { status: 400 }
      );
    }

    // Determine corrected label
    let corrected_label: string | null = null;

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
      console.error("Supabase insert error:", error);

      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      );
    }

    console.log("Report stored successfully");

    return NextResponse.json({
      message: "Report stored successfully",
      data
    });

  } catch (err) {
    console.error("Report route error:", err);

    return NextResponse.json(
      { error: "Invalid request" },
      { status: 400 }
    );
  }
}