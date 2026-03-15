/**
 * ScamShield — LLM-based scam detection and explainability.
 * Supports Gemini (primary) and OpenAI (fallback). Returns structured risk + reasons + explanation.
 */

import { detectLanguage, buildBilingualInstruction } from './language'

export type RiskLevel = "low" | "medium" | "high" | "critical";

export interface AnalyzeResult {
  riskLevel: RiskLevel;
  riskScore: number; // 0–100
  reasons: string[];
  explanation: string;
  recommendedAction: string;
  detectedLanguage?: string; // ISO code, e.g. "zh", "ar" — set when non-English content detected
}

export interface UserContext {
  name?: string;              // user's real name — LLM addresses them personally
  neverUsedCrypto?: boolean;
  typicalContacts?: string[]; // e.g. ["family", "coworkers"]
  knownDomains?: string[];
  neverSentGiftCards?: boolean;
  locale?: string; // e.g. "en", "fr" for explanation language
}

export interface AnalyzeInput {
  contentType: "text" | "url" | "image" | "document";
  text?: string;
  url?: string;
  imageBase64?: string;
  documentBase64?: string;
  documentMimeType?: string; // e.g. "application/pdf", "text/plain"
  userContext?: UserContext;
  // URL analysis extras
  fetchedPageText?: string;   // visible text extracted from the fetched page
  fetchedPageTitle?: string;  // <title> of the fetched page
  finalUrl?: string;          // URL after following redirects
  urlRedirected?: boolean;    // true if original URL redirected elsewhere
}

const STRUCTURED_PROMPT = `You are a fraud and scam detection assistant for vulnerable users (seniors, immigrants, first-time internet users). Your job is to analyze content and return a JSON object with:
- riskLevel: one of "low", "medium", "high", "critical"
- riskScore: number 0-100 (0 = safe, 100 = definite scam)
- reasons: array of short reason strings (e.g. "Urgency language", "Bank impersonation", "Requests verification code")
- explanation: 1-3 sentences in plain language (no jargon) explaining the risk to the user
- recommendedAction: one short sentence (e.g. "Do not reply or click. Contact your bank via official website.")

The content may be written in ANY language — detect and analyze it regardless of language. Scam patterns exist in every language. If the user context specifies a preferred locale, write the explanation and recommendedAction in that language; otherwise use English.

Consider these scam patterns: urgency or pressure, impersonation (bank/CRA/IRS/support), requests for verification codes or passwords, money transfers, crypto or gift card requests, fake job offers with unrealistic pay, phishing links, too-good-to-be-true offers, threats of arrest or legal action.

Respond with exactly one JSON object. No markdown, no code blocks, no text before or after, no bullet points. Example: {"riskLevel":"low","riskScore":5,"reasons":[],"explanation":"...","recommendedAction":"..."}`;

function buildContentPrompt(input: AnalyzeInput, behavioralHints: string[]): string {
  const parts: string[] = [];

  if (input.contentType === "text" && input.text) {
    parts.push("Content to analyze (text):\n" + input.text);
  }
  if (input.contentType === "url" && input.url) {
    const urlLines = ["URL to analyze:\n" + input.url];
    if (input.urlRedirected && input.finalUrl && input.finalUrl !== input.url) {
      urlLines.push("⚠ This URL redirects to: " + input.finalUrl);
    }
    if (input.fetchedPageTitle) {
      urlLines.push("Page title: " + input.fetchedPageTitle);
    }
    parts.push(urlLines.join("\n"));

    if (input.fetchedPageText) {
      parts.push(
        "Visible page content (first 10 000 chars — look for urgency, impersonation, credential requests, prize claims, payment demands):\n" +
        input.fetchedPageText
      );
    }
  }
  if (input.contentType === "image" && input.imageBase64) {
    parts.push("Content to analyze: an image (screenshot or message). Describe what you see and assess scam risk.");
  }
  if (input.contentType === "document" && input.documentBase64) {
    parts.push("Content to analyze: an uploaded document. Read all visible text, headings, fine print, links, and sender/recipient details, then assess scam or fraud risk.");
  }

  if (input.userContext) {
    const ctx = input.userContext;
    const ctxLines: string[] = ["User context (use for personalization — address the user by name in your explanation):"];
    if (ctx.name) ctxLines.push("- User's name: " + ctx.name + " (use their name when explaining the risk, e.g. '" + ctx.name + ", you have never used Bitcoin…')");
    if (ctx.neverUsedCrypto) ctxLines.push("- " + (ctx.name ?? "The user") + " has NEVER used cryptocurrency. Any crypto request is highly suspicious for them.");
    if (ctx.neverSentGiftCards) ctxLines.push("- " + (ctx.name ?? "The user") + " has NEVER sent gift cards as payment. Gift card requests are a strong scam signal.");
    if (ctx.typicalContacts?.length) ctxLines.push("- Typical contacts: " + ctx.typicalContacts.join(", "));
    if (ctx.knownDomains?.length) ctxLines.push("- Known safe domains: " + ctx.knownDomains.slice(0, 20).join(", "));
    if (ctx.locale) ctxLines.push("- Prefer explanation in: " + ctx.locale);
    parts.push(ctxLines.join("\n"));
  }

  if (behavioralHints.length > 0) {
    parts.push("Behavioral hints (include in reasons if relevant):\n" + behavioralHints.join("\n"));
  }

  // Auto-detect script language and request bilingual output when non-English
  const textSample = input.text ?? input.url ?? ''
  if (textSample) {
    const detected = detectLanguage(textSample)
    const bilingualInstr = buildBilingualInstruction(detected)
    if (bilingualInstr) parts.push(bilingualInstr)
  }

  return parts.join("\n\n");
}

function parseStructuredResponse(raw: string): AnalyzeResult {
  let cleaned = raw.replace(/^```json\s*/i, "").replace(/\s*```\s*$/i, "").trim();
  // Extract first {...} in case the model added text before/after
  const brace = cleaned.indexOf("{");
  if (brace >= 0) {
    const lastBrace = cleaned.lastIndexOf("}");
    if (lastBrace > brace) cleaned = cleaned.slice(brace, lastBrace + 1);
  }
  let parsed: Record<string, unknown>;
  try {
    parsed = JSON.parse(cleaned) as Record<string, unknown>;
  } catch {
    // Model returned non-JSON; return a safe default with the raw text as explanation
    return {
      riskLevel: "medium",
      riskScore: 50,
      reasons: ["Could not parse model response as JSON"],
      explanation: raw.slice(0, 500) || "No explanation provided.",
      recommendedAction: "Be cautious and verify through official channels.",
    };
  }

  const riskLevel = ["low", "medium", "high", "critical"].includes(String(parsed.riskLevel))
    ? (parsed.riskLevel as RiskLevel)
    : "medium";
  const riskScore = Math.min(100, Math.max(0, Number(parsed.riskScore) ?? 50));
  const reasons = Array.isArray(parsed.reasons)
    ? (parsed.reasons as string[]).filter(Boolean)
    : [];
  const explanation = String(parsed.explanation ?? "No explanation provided.");
  const recommendedAction = String(parsed.recommendedAction ?? "Be cautious and verify through official channels.");

  return {
    riskLevel,
    riskScore,
    reasons,
    explanation,
    recommendedAction,
  };
}

// Prefer a model with free-tier quota; fallback if one returns 404
const GEMINI_MODELS = ["gemini-2.5-flash-lite", "gemini-2.0-flash", "gemini-1.5-flash"];

function detectMimeType(base64: string): string {
  if (base64.startsWith("iVBOR")) return "image/png";
  if (base64.startsWith("R0lGOD")) return "image/gif";
  if (base64.startsWith("UklGR")) return "image/webp";
  return "image/jpeg";
}

async function callGemini(input: AnalyzeInput, behavioralHints: string[]): Promise<AnalyzeResult> {
  // For document analysis use the dedicated key if provided, else fall back to primary
  const isMultimodal = input.contentType === "image" || input.contentType === "document";
  const apiKey =
    (isMultimodal && process.env.GEMINI_API_KEY_DOCS) ||
    process.env.GEMINI_API_KEY;
  if (!apiKey) throw new Error("GEMINI_API_KEY is not set");

  const { GoogleGenerativeAI } = await import("@google/generative-ai");
  const genAI = new GoogleGenerativeAI(apiKey);

  const contentPrompt = buildContentPrompt(input, behavioralHints);
  const fullTextPrompt = STRUCTURED_PROMPT + "\n\n" + contentPrompt;

  let lastError: Error | null = null;
  for (const modelId of GEMINI_MODELS) {
    try {
      const model = genAI.getGenerativeModel({ model: modelId });
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      let result: any;

      if (input.contentType === "image" && input.imageBase64) {
        const mimeType = detectMimeType(input.imageBase64);
        result = await model.generateContent({
          contents: [{
            role: "user",
            parts: [
              { text: STRUCTURED_PROMPT + "\n\nAnalyze every piece of visible text in this screenshot for scam or fraud indicators." },
              { inlineData: { mimeType, data: input.imageBase64 } },
              ...(behavioralHints.length ? [{ text: "Behavioral hints:\n" + behavioralHints.join("\n") }] : []),
            ],
          }],
        });
      } else if (input.contentType === "document" && input.documentBase64) {
        const mimeType = input.documentMimeType || "application/pdf";
        result = await model.generateContent({
          contents: [{
            role: "user",
            parts: [
              { text: STRUCTURED_PROMPT + "\n\nAnalyze the full content of this document for scam, fraud, or phishing. Pay attention to sender details, urgent language, requests for money or personal info, suspicious links, and fine print." },
              { inlineData: { mimeType, data: input.documentBase64 } },
              ...(behavioralHints.length ? [{ text: "Behavioral hints:\n" + behavioralHints.join("\n") }] : []),
              ...(contentPrompt ? [{ text: contentPrompt }] : []),
            ],
          }],
        });
      } else {
        result = await model.generateContent(fullTextPrompt);
      }

      const text: string = result.response.text();
      if (!text) throw new Error("Gemini returned empty response");
      return parseStructuredResponse(text);
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      lastError = err instanceof Error ? err : new Error(message);
      if (message.includes("429") && message.includes("retry")) {
        await new Promise((r) => setTimeout(r, 30_000));
        try {
          const model = genAI.getGenerativeModel({ model: modelId });
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const retry: any = await model.generateContent(fullTextPrompt);
          const text: string = retry.response.text();
          if (text) return parseStructuredResponse(text);
        } catch (retryErr) {
          lastError = retryErr instanceof Error ? retryErr : new Error(String(retryErr));
        }
      }
      if (message.includes("404") || message.includes("not found")) continue;
      throw lastError;
    }
  }
  throw lastError ?? new Error("Gemini request failed");
}

async function callOpenAI(input: AnalyzeInput, behavioralHints: string[]): Promise<AnalyzeResult> {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) throw new Error("OPENAI_API_KEY is not set");

  const contentPrompt = buildContentPrompt(input, behavioralHints);
  const fullPrompt = STRUCTURED_PROMPT + "\n\n" + contentPrompt;

  const OpenAI = (await import("openai")).default;
  const openai = new OpenAI({ apiKey });
  const completion = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [{ role: "user", content: fullPrompt }],
    temperature: 0.2,
  });
  const text = completion.choices[0]?.message?.content;
  if (!text) throw new Error("OpenAI returned empty response");
  return parseStructuredResponse(text);
}

/**
 * Watsonx.ai (IBM) — for IBM prize. Uses Granite or other watsonx model.
 * Required in .env.local: WATSONX_AI_AUTH_TYPE=iam, WATSONX_AI_APIKEY, WATSONX_PROJECT_ID.
 */
async function callWatsonx(input: AnalyzeInput, behavioralHints: string[]): Promise<AnalyzeResult> {
  const projectId = process.env.WATSONX_PROJECT_ID;
  if (!process.env.WATSONX_AI_APIKEY || !projectId) {
    throw new Error("WATSONX_AI_APIKEY and WATSONX_PROJECT_ID are required for Watsonx. Set WATSONX_AI_AUTH_TYPE=iam for API key auth.");
  }

  const contentPrompt = buildContentPrompt(input, behavioralHints);
  const fullPrompt = STRUCTURED_PROMPT + "\n\n" + contentPrompt;

  const modelId = process.env.WATSONX_MODEL_ID ?? "ibm/granite-3-8b-instruct";

  const { WatsonXAI } = await import("@ibm-cloud/watsonx-ai");
  const watsonx = WatsonXAI.newInstance({
    version: "2024-05-31",
    serviceUrl: process.env.WATSONX_SERVICE_URL ?? "https://us-south.ml.cloud.ibm.com",
  });
  const result = await watsonx.generateText({
    input: fullPrompt,
    modelId,
    projectId,
    parameters: { max_new_tokens: 1024, temperature: 0.2 },
  });
  const text = (result as { result?: { results?: Array<{ generated_text?: string }> } }).result?.results?.[0]?.generated_text ?? "";
  if (!text) throw new Error("Watsonx returned empty response");
  return parseStructuredResponse(text);
}

/**
 * Run LLM scam detection. Priority: Watsonx (IBM) > Gemini > OpenAI.
 * Merges behavioral hints from lib/behavioral into the prompt.
 */
export async function analyzeWithLLM(
  input: AnalyzeInput,
  behavioralHints: string[] = []
): Promise<AnalyzeResult> {
  // Detect language for bilingual output annotation
  const textSample = input.text ?? input.url ?? ''
  const detectedLang = textSample ? detectLanguage(textSample) : 'en'

  // Watsonx/Granite is text-only — skip for image/document inputs and fall through to Gemini Vision
  let result: AnalyzeResult
  if (input.contentType !== "image" && input.contentType !== "document" && process.env.WATSONX_AI_APIKEY && process.env.WATSONX_PROJECT_ID) {
    result = await callWatsonx(input, behavioralHints);
  } else if (process.env.GEMINI_API_KEY) {
    result = await callGemini(input, behavioralHints);
  } else if (process.env.OPENAI_API_KEY) {
    result = await callOpenAI(input, behavioralHints);
  } else {
    throw new Error("Set WATSONX_AI_APIKEY+WATSONX_PROJECT_ID, GEMINI_API_KEY, or OPENAI_API_KEY in environment.");
  }

  // Attach detected language when non-English
  if (detectedLang !== 'en') result.detectedLanguage = detectedLang
  return result
}
