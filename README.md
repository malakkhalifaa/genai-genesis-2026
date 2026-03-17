# ScamShield: AI Personal Fraud Guardian

**GenAI Genesis Hackathon** · TD Fraud Detection · IBM Best Use of Cloud Services

An AI that learns how *you* use the internet and explains risk in plain language — so seniors, immigrants, and first-time users can spot scams before they click.

---

## Try it

| | |
|---|---|
| **Live demo** | [https://demo-sigma-nine-38.vercel.app/](https://demo-sigma-nine-38.vercel.app/) |
| **Demo video** | [Watch on YouTube](https://www.youtube.com/watch?v=ewUyoqX0jk8&t=79s) |

---

## What it does

- **Analyze messages, URLs, and images** — Get a risk level, score, reasons, plain-language explanation, and recommended action in seconds.
- **Personalized for you** — Uses your context (e.g. “never used crypto,” known domains) so the same message can get a different, relevant explanation.
- **Voice & live call** — Browser transcribes; we analyze the text. We never intercept the call.
- **Face ID** — Runs in your browser only; no biometrics leave your device.
- **8 languages** — “Is this safe?” in the user’s language (e.g. Chinese, Punjabi, Arabic, Tagalog).
- **Learns from you** — When you mark scam or legit, we feed it back so the model doesn’t repeat the same mistakes.

---

## Screenshots

### Analyzer UI

Paste a message or URL and get risk level, reasons, explanation, and recommended action.

<img width="800" alt="ScamShield analyzer UI" src="https://github.com/user-attachments/assets/512b6b21-d56f-429d-96ea-1c5e8d966b13" />

### Login

<img width="800" alt="ScamShield login page" src="https://github.com/user-attachments/assets/204fefac-8fbb-45bc-8e9c-5a84372bad3c" />

### Dashboard

<img width="800" alt="ScamShield dashboard" src="https://github.com/user-attachments/assets/fc304962-ff76-425e-a300-2d31b6b46413" />

### Live call demo

Browser transcribes; we analyze the text. We never intercept the call.

<img width="700" alt="ScamShield live call demo" src="https://github.com/user-attachments/assets/cdf89c82-1c59-48e7-bdce-4a8d152346eb" />

### Chrome extension

“Analyze this page” / “Analyze selected text” from any tab.

<img width="500" alt="ScamShield Chrome extension" src="https://github.com/user-attachments/assets/f18df6ff-188f-43d1-bcb5-919516ff5061" />

---

## Quick start

### 1. Clone and install

```bash
git clone https://github.com/malakkhalifaa/genai-genesis-2026.git
cd genai-genesis-2026
npm install
cp .env.example .env.local
```

### 2. Set up API keys (pick one or more)

Open `.env.local` and add:

- **Watsonx (IBM):** `WATSONX_AI_APIKEY`, `WATSONX_PROJECT_ID` — see [docs/WATSON-IBM.md](docs/WATSON-IBM.md).
- **Gemini:** `GEMINI_API_KEY` — [Google AI Studio](https://aistudio.google.com/).
- **OpenAI:** `OPENAI_API_KEY` — [OpenAI API keys](https://platform.openai.com/api-keys).

The analyzer uses **Watsonx first**, then Gemini, then OpenAI (whichever is configured).

### 3. Run

```bash
npm run dev
```

Open **http://localhost:3000**. Paste a message or URL → **Analyze** → see risk level, reasons, explanation, and recommended action.

### 4. Optional: Supabase (profiles & history)

For user profiles and report history, set your Supabase URL and anon key in `.env.local`. See `supabase-schema.sql` for the schema.

---

## Tech stack

| Layer        | What we use |
|-------------|-------------|
| **App**     | Next.js (App Router), React, Tailwind |
| **API**     | Next.js API routes (`/api/analyze`, `/api/profile`, `/api/report`, etc.) |
| **AI**      | IBM Watsonx (Granite), Google Gemini, or OpenAI — same prompt, env-driven |
| **Rules**   | Behavioral hints (`lib/behavioral.ts`), URL/phishing checks (`lib/phishing.ts`) |
| **Data**    | Supabase (Postgres) — profiles, reports, history |
| **Extension** | Chrome Manifest V3 — “Analyze this page” / “Analyze selected text” |
| **Deploy**  | Vercel (app + API) |

---

## How the analyzer works (simple)

1. **You send** content (text, URL, or image) and optional user context.
2. **We add hints** — Behavioral (e.g. “user has never used crypto”) and URL checks (suspicious TLDs, fake-login patterns).
3. **We build one prompt** — Instructions + content + context + hints.
4. **The LLM returns** one JSON: `riskLevel`, `riskScore`, `reasons`, `explanation`, `recommendedAction`.
5. **We parse and return** that to the frontend (with a safe default if the model returns invalid JSON).

No retraining — we **instruct** the model with scam patterns and **guide** each request with your context and rule-based hints.

---

## API (for extension / integrations)

**POST /api/analyze**

- **Body:** `{ contentType: "text" | "url" | "image", text?, url?, imageBase64?, userContext?, userId? }`
- **Response:** `{ riskLevel, riskScore, reasons, explanation, recommendedAction }`

Example:

```bash
curl -X POST http://localhost:3000/api/analyze \
  -H "Content-Type: application/json" \
  -d '{"contentType":"text","text":"Send $500 in Bitcoin to unlock your account."}'
```

---

## Repo structure (high level)

```
genai-genesis-2026/
├── README.md
├── app/                    # Next.js app (root app dir)
│   ├── page.tsx
│   ├── layout.tsx
│   └── api/                # API routes
│       ├── analyze/        # Scam analysis (LLM + hints)
│       ├── profile/        # User profile
│       └── report/         # Store reports
├── src/                    # Additional app pages (dashboard, demo, etc.)
│   └── app/
├── lib/                    # Shared logic
│   ├── ai.ts               # LLM (Watsonx / Gemini / OpenAI)
│   ├── behavioral.ts       # User-context hints
│   ├── phishing.ts         # URL checks
│   └── db.ts               # Supabase client
├── extension/              # Chrome extension
│   ├── manifest.json
│   ├── popup.html, popup.js
│   └── ...
├── docs/
│   └── WATSON-IBM.md       # Watsonx setup
└── supabase-schema.sql     # DB schema
```

---

## Vision & impact

**Problem:** Vulnerable communities (seniors, immigrants, first-time users) are targeted the most. They need a simple “Is this safe?” check in plain language — before the click.

**What we built:** One place to check messages, links, and (optionally) call audio. Personalized explanations (“this is risky for you because…”) and learning from user corrections so the system gets better over time.

**Hackathon fit:** **TD Fraud Detection** (behavioral + explainability) · **IBM Best Use of Cloud Services** (Watsonx/Granite on IBM Cloud).

---

## License

MIT (or your chosen license).
