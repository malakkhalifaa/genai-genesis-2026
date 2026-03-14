# ScamShield — ML / LLM Layer

This document explains the **machine learning and LLM** part of ScamShield: how scam detection works, what each file does, and how to run and extend it.

---

## Overview

The ML layer does three things:

1. **LLM scam detection** — A large language model (Gemini or GPT) analyzes text, URLs, or image content and returns a **risk score**, **reasons**, a **plain-language explanation**, and a **recommended action**.
2. **Behavioral signals** — Your **user context** (e.g. “never used crypto”, “typical contacts”) is compared to the content. The model gets hints like “Unusual for you: you have never sent cryptocurrency.”
3. **URL / phishing check** — Simple heuristics (suspicious TLDs, phishy patterns, homograph-style risks) feed into the LLM so it can factor in domain risk.

Everything is designed to be **explainable**: every response includes clear reasons and a short explanation in plain language for vulnerable users.

---

## Files

| File | Purpose |
|------|--------|
| **`lib/ai.ts`** | LLM integration. Builds the prompt, calls Gemini or OpenAI, parses structured JSON (`riskLevel`, `riskScore`, `reasons`, `explanation`, `recommendedAction`). |
| **`lib/behavioral.ts`** | Defines `UserContext` and `UserProfile`. `getBehavioralHints()` compares the current input to the user’s profile and returns short reason strings for the LLM. |
| **`lib/phishing.ts`** | URL/domain checks: suspicious TLDs, phishy substrings, homograph-style patterns. Returns signals that are passed into the LLM prompt. |
| **`app/api/analyze/route.ts`** | **POST /api/analyze** — Accepts `contentType`, `text`/`url`/`imageBase64`, optional `userContext`. Calls behavioral + phishing helpers, then the LLM, and returns the agreed JSON. |

---

## API Contract

**Request (POST /api/analyze)**

```json
{
  "contentType": "text" | "url" | "image",
  "text": "optional message or snippet",
  "url": "optional URL to check",
  "imageBase64": "optional base64 image (for contentType image)",
  "userContext": {
    "neverUsedCrypto": true,
    "neverSentGiftCards": true,
    "typicalContacts": ["family", "coworkers"],
    "knownDomains": ["mybank.com", "canada.ca"],
    "locale": "en"
  }
}
```

**Response**

```json
{
  "riskLevel": "low" | "medium" | "high" | "critical",
  "riskScore": 0,
  "reasons": ["Urgency language", "Bank impersonation"],
  "explanation": "This message tries to rush you and pretends to be your bank. Real banks don’t ask for codes by text.",
  "recommendedAction": "Do not reply or click. Contact your bank via their official website."
}
```

---

## Environment

- **`GEMINI_API_KEY`** — Prefer this for the LLM (e.g. Google AI Studio). Used first if set.
- **`OPENAI_API_KEY`** — Fallback; uses `gpt-4o-mini` for cost-effective runs.

Copy `.env.example` to `.env.local` and set one of these so the analyze route works.

---

## How the LLM Is Used

1. **Prompt** — A fixed system-style prompt tells the model it’s a fraud-detection assistant for vulnerable users and that it must respond with **only** valid JSON (riskLevel, riskScore, reasons, explanation, recommendedAction).
2. **Content** — The user’s text, URL, or a short description of the image is added to the prompt.
3. **User context** — Optional fields (e.g. never used crypto, known domains) are added so the model can personalize (e.g. “Unusual for you: you have never sent cryptocurrency”).
4. **Behavioral hints** — `lib/behavioral.ts` produces hints from the user profile; these are appended so the LLM can turn them into `reasons` and `explanation`.
5. **URL signals** — `lib/phishing.ts` runs on the URL (if any) and adds lines like `[URL check] Suspicious TLD: .tk (medium)` so the LLM can factor them in.
6. **Parsing** — The model’s reply is parsed as JSON; if it’s wrapped in markdown code blocks, they are stripped first.

Scam patterns we explicitly ask the model to consider: urgency/pressure, impersonation (bank/CRA/support), verification code or password requests, money transfers, crypto or gift card requests, fake job offers, phishing links, too-good-to-be-true offers.

---

## Demo Use Cases

The README describes four demo scenarios. The ML layer is built to support them:

1. **Phishing website** — Send `contentType: "url"` and the URL. Phishing module + LLM return “Possible phishing”, domain mismatch, recommended action.
2. **Scam message** — Send `contentType: "text"` with e.g. “Send verification code urgently”. LLM returns bank impersonation, urgency, and plain-language explanation.
3. **Fake payment request** — Send text like “Pay using crypto gift cards” with `userContext: { neverUsedCrypto: true }`. Behavioral hints + LLM produce “Unusual for you: you have never sent crypto” and recommended action.
4. **Fake job offer** — Send text like “Remote job – $5000 weekly”. LLM returns unrealistic salary, job-scam pattern, explanation, and action.

---

## Running the ML Layer

1. Install and configure env:
   ```bash
   npm install
   cp .env.example .env.local
   # Edit .env.local: set GEMINI_API_KEY or OPENAI_API_KEY
   ```
2. Run the app:
   ```bash
   npm run dev
   ```
3. Open `http://localhost:3000` and use the simple test form, or call **POST http://localhost:3000/api/analyze** with the body above.

No database is required for the analyze endpoint; it only needs an LLM API key.

---

## Extending the ML Layer

- **Blocklists** — In `lib/phishing.ts`, add checks against a list of known-bad domains and pass results into the prompt or into a small scoring step before the LLM.
- **More user context** — Extend `UserContext` in `lib/behavioral.ts` (and the DB profile) and add matching logic in `getBehavioralHints()`.
- **Image input** — For `contentType: "image"`, the current prompt asks the model to describe the image and assess risk. For better accuracy, use a vision-capable model (e.g. Gemini with image input) and pass the base64 image in the API call; the same structured JSON contract can be kept.
- **Stricter JSON** — For production, consider structured output (e.g. Gemini JSON mode or OpenAI function calling) so the response is always valid JSON.

---

## Summary

- **LLM** in `lib/ai.ts` does the main scam detection and explainability.
- **Behavioral** logic in `lib/behavioral.ts` adds personalized “unusual for you” hints.
- **Phishing** logic in `lib/phishing.ts` adds URL/domain signals.
- **POST /api/analyze** in `app/api/analyze/route.ts` ties them together and returns the agreed JSON. No git commits are made from this workflow; you can commit the changes yourself when ready.
