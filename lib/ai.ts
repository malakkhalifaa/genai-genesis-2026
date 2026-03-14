/**
 * ScamShield — LLM-based scam detection and explainability.
 * Supports Gemini (primary) and OpenAI (fallback). Returns structured risk + reasons + explanation.
 */

export type RiskLevel = "low" | "medium" | "high" | "critical";

export interface AnalyzeResult {
  riskLevel: RiskLevel;
  riskScore: number; // 0–100
  reasons: string[];
  explanation: string;
  recommendedAction: string;
}

export interface UserContext {
  neverUsedCrypto?: boolean;
  typicalContacts?: string[]; // e.g. ["family", "coworkers"]
  knownDomains?: string[];
  neverSentGiftCards?: boolean;
  locale?: string; // e.g. "en", "fr" for explanation language
}

export interface AnalyzeInput {
  contentType: "text" | "url" | "image";
  text?: string;
  url?: string;
  imageBase64?: string;
  userContext?: UserContext;
}

const STRUCTURED_PROMPT = `You are a fraud and scam detection assistant for vulnerable users (seniors, immigrants, first-time internet users). Your job is to analyze content and return a JSON object with:
- riskLevel: one of "low", "medium", "high", "critical"
- riskScore: number 0-100 (0 = safe, 100 = definite scam)
- reasons: array of short reason strings (e.g. "Urgency language", "Bank impersonation", "Requests verification code")
- explanation: 1-3 sentences in plain language (no jargon) explaining the risk to the user
- recommendedAction: one short sentence (e.g. "Do not reply or click. Contact your bank via official website.")

Consider these scam patterns: urgency or pressure, impersonation (bank/CRA/support), requests for verification codes or passwords, money transfers, crypto or gift card requests, fake job offers with unrealistic pay, phishing links, too-good-to-be-true offers.

Respond ONLY with valid JSON, no markdown or extra text.`;

function buildContentPrompt(input: AnalyzeInput, behavioralHints: string[]): string {
  const parts: string[] = [];

  if (input.contentType === "text" && input.text) {
    parts.push("Content to analyze (text):\n" + input.text);
  }
  if (input.contentType === "url" && input.url) {
    parts.push("URL to analyze:\n" + input.url);
  }
  if (input.contentType === "image" && input.imageBase64) {
    parts.push("Content to analyze: an image (screenshot or message). Describe what you see and assess scam risk.");
  }

  if (input.userContext) {
    const ctx = input.userContext;
    const ctxLines: string[] = ["User context (use for personalization):"];
    if (ctx.neverUsedCrypto) ctxLines.push("- User has never used cryptocurrency.");
    if (ctx.neverSentGiftCards) ctxLines.push("- User has never sent gift cards as payment.");
    if (ctx.typicalContacts?.length) ctxLines.push("- Typical contacts: " + ctx.typicalContacts.join(", "));
    if (ctx.knownDomains?.length) ctxLines.push("- Known safe domains: " + ctx.knownDomains.slice(0, 20).join(", "));
    if (ctx.locale) ctxLines.push("- Prefer explanation in: " + ctx.locale);
    parts.push(ctxLines.join("\n"));
  }

  if (behavioralHints.length > 0) {
    parts.push("Behavioral hints (include in reasons if relevant):\n" + behavioralHints.join("\n"));
  }

  return parts.join("\n\n");
}

function parseStructuredResponse(raw: string): AnalyzeResult {
  const cleaned = raw.replace(/^```json\s*/i, "").replace(/\s*```\s*$/i, "").trim();
  const parsed = JSON.parse(cleaned) as Record<string, unknown>;

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

async function callGeminiWithModel(
  genAI: { getGenerativeModel: (opts: { model: string }) => { generateContent: (p: string) => Promise<{ response: { text: () => string } }> } },
  modelId: string,
  fullPrompt: string
): Promise<string> {
  const model = genAI.getGenerativeModel({ model: modelId });
  const result = await model.generateContent(fullPrompt);
  const response = result.response;
  const text = response.text();
  if (!text) throw new Error("Gemini returned empty response");
  return text;
}

async function callGemini(input: AnalyzeInput, behavioralHints: string[]): Promise<AnalyzeResult> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) throw new Error("GEMINI_API_KEY is not set");

  const { GoogleGenerativeAI } = await import("@google/generative-ai");
  const genAI = new GoogleGenerativeAI(apiKey);
  const contentPrompt = buildContentPrompt(input, behavioralHints);
  const fullPrompt = STRUCTURED_PROMPT + "\n\n" + contentPrompt;

  let lastError: Error | null = null;
  for (const modelId of GEMINI_MODELS) {
    try {
      const text = await callGeminiWithModel(genAI, modelId, fullPrompt);
      return parseStructuredResponse(text);
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      lastError = err instanceof Error ? err : new Error(message);
      // 429 = quota/rate limit — wait and retry once for same model
      if (message.includes("429") && message.includes("retry")) {
        const waitMs = 30_000;
        await new Promise((r) => setTimeout(r, waitMs));
        try {
          const text = await callGeminiWithModel(genAI, modelId, fullPrompt);
          return parseStructuredResponse(text);
        } catch (retryErr) {
          lastError = retryErr instanceof Error ? retryErr : new Error(String(retryErr));
        }
      }
      // 404 = model not found — try next model
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
 * Run LLM scam detection. Uses Gemini if GEMINI_API_KEY is set, else OpenAI.
 * Merges behavioral hints from lib/behavioral into the prompt.
 */
export async function analyzeWithLLM(
  input: AnalyzeInput,
  behavioralHints: string[] = []
): Promise<AnalyzeResult> {
  if (process.env.GEMINI_API_KEY) {
    return callGemini(input, behavioralHints);
  }
  if (process.env.OPENAI_API_KEY) {
    return callOpenAI(input, behavioralHints);
  }
  throw new Error("Set GEMINI_API_KEY or OPENAI_API_KEY in environment.");
}
