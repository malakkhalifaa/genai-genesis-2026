/**
 * POST /api/analyze
 * Body: { contentType: "text"|"url"|"image", text?, url?, imageBase64?, userContext? }
 * Response: { riskLevel, riskScore, reasons, explanation, recommendedAction }
 */

import { NextRequest, NextResponse } from "next/server";
import { analyzeWithLLM } from "../../../lib/ai";
import { getBehavioralHints } from "../../../lib/behavioral";
import { getPhishingHintLines } from "../../../lib/phishing";
import { getUserContext } from "@/lib/userContext";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const contentType = body.contentType ?? "text";
    const text = body.text ?? "";
    const url = body.url ?? "";
    const imageBase64 = body.imageBase64;
    const userId = body.userId;
    let userContext = body.userContext ?? null;

    if (contentType === "text" && !text && !url) {
      return NextResponse.json(
        { error: "Missing text or url for contentType" },
        { status: 400 }
      );
    }
    if (contentType === "url" && !url) {
      return NextResponse.json(
        { error: "Missing url for contentType 'url'" },
        { status: 400 }
      );
    }
    if (contentType === "image" && !imageBase64) {
      return NextResponse.json(
        { error: "Missing imageBase64 for contentType 'image'" },
        { status: 400 }
      );
    }
    if (userId) {
      userContext = await getUserContext(userId);
    }

    const input = {
      contentType: contentType as "text" | "url" | "image",
      text: text || undefined,
      url: url || undefined,
      imageBase64: imageBase64 || undefined,
      userContext: userContext || undefined,
    };

    const behavioralHints = getBehavioralHints(
      { contentType, text, url },
      userContext
    );
    const phishingHints =
      (url && getPhishingHintLines(url)) || [];
    const allHints = [...behavioralHints, ...phishingHints];

    const result = await analyzeWithLLM(input, allHints);

    let content = "";

    if (contentType === "text") content = text;
    else if (contentType === "url") content = url;
    else if (contentType === "image") content = "[image]";

    try {
      await fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/report`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          content: content,
          content_type: contentType,
          platform: body.platform ?? "unknown",
          region: body.region ?? "unknown",
          risk_score: result.riskScore,
          risk_level: result.riskLevel,
          model_name: result.model_name,
          model_version: result.model_version
        }),
      });
    } catch (err) {
      console.error("Report logging failed:", err);
    }
    
    return NextResponse.json(result);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Analysis failed";
    return NextResponse.json(
      { error: message },
      { status: 500 }
    );
  }
}
