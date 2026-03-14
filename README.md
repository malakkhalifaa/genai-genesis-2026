# ScamShield: AI Personal Fraud Guardian

**GenAI Genesis Hackathon · Social Impact Category**

An AI that learns your behavior and protects you across **messages, websites, emails, payments, and links** — flagging what’s unusual or risky **for you**, not just generic scams.

---

## Table of Contents

- [How to use](#how-to-use)
- [Vision & Impact](#vision--impact)
- [Core Concept](#core-concept)
- [Demo Use Cases (4 Scenarios)](#demo-use-cases-4-scenarios)
- [Architecture](#architecture)
- [Tech Stack](#tech-stack)
- [Repo Structure](#repo-structure)
- [Setup & Run](#setup--run)
- [Team & Task Split (4 People)](#team--task-split-4-people)
- [Demo Plan](#demo-plan)
- [References](#references)

---

## How to use

This section walks you through running ScamShield and testing the scam analyzer.

### 1. Get an API key (one-time)

The analyzer needs a **Gemini** or **OpenAI** API key.

- **Gemini (free tier):** Go to [Google AI Studio](https://aistudio.google.com/) → sign in → **Get API key** / **Create API key** → copy the key.
- **OpenAI:** Go to [OpenAI API keys](https://platform.openai.com/api-keys) → create a key and copy it.

### 2. Install and configure

In the project folder:

```bash
npm install
cp .env.example .env.local
```

Open **`.env.local`** and set **one** of these (replace with your real key):

- `GEMINI_API_KEY=your_key_here`
- or `OPENAI_API_KEY=your_key_here`

Do **not** commit `.env.local` or share your key; it is ignored by git.

### 3. Run the app

```bash
npm run dev
```

When it says "Ready", open a browser and go to: **http://localhost:3000**.

### 4. Test the analyzer

- Choose **Text** or **URL**.
- Paste a message or a link (e.g. a suspicious text or a known scam example).
- Click **Analyze**.

You'll see a **risk level** (low/medium/high/critical), a **score** (0–100), **reasons**, a short **explanation**, and a **recommended action**. Try a normal greeting vs. a scammy message to see the difference.

### 5. Optional: call the API directly

With the app running, you can call the analyze API from another terminal or from code:

```bash
curl -X POST http://localhost:3000/api/analyze -H "Content-Type: application/json" -d "{\"contentType\":\"text\",\"text\":\"Send your verification code now to unlock your account\"}"
```

Response includes `riskLevel`, `riskScore`, `reasons`, `explanation`, and `recommendedAction`.

---

## Vision & Impact

**One-liner:**  
*Vulnerable communities are the most targeted by scams. Our AI guardian learns their behavior and protects them across messages, websites, and payments — and explains in simple language.*

**Target users:** Seniors, immigrants, students, first-time internet users.

**Why it fits Social Impact:**  
Prevents financial harm, explains scams in plain language, works across the channels where people actually get scammed (not just one app).

**Hackathon angles:**  
- **TD Fraud Detection** — Behavioral fraud detection + explainability.  
- **Google Community Impact** — Protect vulnerable users.  
- **IBM Technology** — Use Watsonx AI (if applicable).

---

## Core Concept

| Channel | What we analyze |
|--------|------------------|
| Messages | WhatsApp, Messenger, SMS — text + context |
| Websites | Phishing pages, fake banking, suspicious domains |
| Emails | Job scams, impersonation, suspicious senders |
| Phone calls | Transcripts (e.g. "Send verification code") |
| Payment requests | Crypto, gift cards, unusual methods |
| Links & forms | URLs before click, fake login/checkout pages |

**Key idea:** AI builds a **personal risk profile** (typical contacts, normal sites, never sent crypto, etc.) and flags **anomalies for you** — like bank fraud detection for everyday life.

---

## Demo Use Cases (4 Scenarios)

Each scenario shows: **risk score** + **reasons** + **explanation** + **recommended action**.

| # | Scenario | What we show |
|---|----------|---------------|
| 1 | **Phishing website** | User opens fake banking site → extension: "Possible phishing. Domain does not match official bank." |
| 2 | **Scam message** | "Send verification code urgently" → "Scam risk: bank impersonation. Banks never ask for codes via message." |
| 3 | **Fake payment request** | "Pay using crypto gift cards" → "Unusual for you: you have never sent crypto. Scammers often request crypto." |
| 4 | **Fake job offer** | "Remote job – $5000 weekly" → "Unrealistic salary, suspicious sender, common job scam pattern." |

---

## Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│  Chrome Extension (popup + content)                              │
│  · Analyze this page · Analyze selected text · (optional) forms  │
└────────────────────────────┬────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│  Frontend (Next.js)                                               │
│  · Paste/upload text, URL, image · Results UI · Optional web app  │
└────────────────────────────┬────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│  Backend API (Next.js API routes / Node)                          │
│  POST /api/analyze  ·  POST /api/profile  ·  GET /api/heatmap    │
└────────────────────────────┬────────────────────────────────────┘
                              │
              ┌───────────────┼───────────────┐
              ▼               ▼               ▼
┌──────────────────┐ ┌──────────────────┐ ┌──────────────────┐
│  ML / AI Layer   │ │  Database         │ │  Phishing / URLs  │
│  · LLM (Gemini/  │ │  · User profile   │ │  · Blocklists     │
│    GPT)          │ │  · Risk history   │ │  · Domain check   │
│  · Scam language │ │  · Reports        │ │  (optional)       │
│  · Behavioral    │ │  (Supabase/       │ └──────────────────┘
│    risk signals  │ │   Postgres)       │
│  · Explainable   │ └──────────────────┘
│    output        │
└──────────────────┘
```

---

## Tech Stack

| Layer | Choice |
|-------|--------|
| **Frontend** | Next.js (React), Tailwind |
| **Backend** | Next.js API routes (or separate Node service) |
| **AI / ML** | Gemini or GPT (LLM), optional small ML model for behavioral signals |
| **Database** | Supabase (Postgres) or Vercel Postgres — profiles, reports, optional heatmap |
| **Extension** | Chrome Manifest V3 (popup + content script) |
| **Deploy** | Vercel (app + API) |

---

## Repo Structure

```
fraud-detection/
├── README.md                 # This file
├── GAME_PLAN.md              # Full hackathon game plan & judging
├── .env.example
├── package.json
│
├── app/                      # Next.js app (Frontend owner)
│   ├── layout.tsx
│   ├── page.tsx
│   ├── globals.css
│   └── api/                  # API routes (shared contract)
│       ├── analyze/route.ts  # → ML owner implements AI logic
│       ├── profile/route.ts  # → DB owner (read/write profile)
│       ├── report/route.ts   # → DB owner (store report)
│       └── heatmap/route.ts  # → DB owner (aggregate by region)
│
├── components/               # Frontend owner
│   ├── AnalyzerForm.tsx
│   ├── ResultCard.tsx
│   └── LanguageSelector.tsx
│
├── lib/                      # Shared / ML owner
│   ├── ai.ts                 # LLM scam detection + explanation (ML)
│   ├── behavioral.ts        # Behavioral risk signals (ML)
│   ├── phishing.ts          # URL/domain check (ML or shared)
│   └── db.ts                 # DB client (Database owner)
│
├── extension/                # Chrome Extension owner
│   ├── manifest.json
│   ├── popup.html, popup.js, popup.css
│   ├── content.js           # Optional: inject warnings on page
│   └── README.md
│
└── docs/                    # Optional: API contract, persona
    └── API.md
```

---

## Setup & Run

**Prerequisites:** Node 18+, npm/pnpm, Chrome (for extension).

1. **Clone and install**
   ```bash
   cd genai-genesis-2026   # or your repo folder name
   npm install
   cp .env.example .env.local
   ```
2. **Environment** (in `.env.local`)
   - `GEMINI_API_KEY` or `OPENAI_API_KEY` for the AI backend.
   - `NEXT_PUBLIC_APP_URL` for the frontend/API base URL (e.g. `http://localhost:3000`).
   - DB: `DATABASE_URL` or Supabase keys (see Database owner section).
3. **Run app**
   ```bash
   npm run dev
   ```
   Open [http://localhost:3000](http://localhost:3000).
4. **Load extension**
   - Open `chrome://extensions` → Developer mode → Load unpacked → select `extension/`.
   - In `extension/popup.js` set `API_BASE` to `http://localhost:3000` (or your deploy URL).

**API contract (everyone must align on):**

- **POST /api/analyze**  
  Body: `{ contentType: "text"|"url"|"image", text?, url?, imageBase64?, userContext? }`  
  Response: `{ riskLevel, riskScore, reasons[], explanation, recommendedAction }`.
- **GET/POST /api/profile**  
  Read/update user risk profile (e.g. `neverUsedCrypto`, `typicalWebsites[]`) for personalization.
- **POST /api/report**  
  Store a report (optional: URL, risk, region for heatmap).
- **GET /api/heatmap**  
  Return aggregated counts by region (optional).

---

## Team & Task Split (4 People)

Work in parallel; sync on the **API contract** and **demo scenarios** above.

---

### Person 1: ML / AI

**Goal:** Scam detection + behavioral signals + explainable output.

**Tasks:**

1. **LLM scam detection (`lib/ai.ts` + used in `app/api/analyze/route.ts`)**
   - Prompt that takes `contentType`, `text` or `url` (or page snippet), and optional `userContext`.
   - Return structured JSON: `riskLevel`, `riskScore` (0–100), `reasons[]`, `explanation`, `recommendedAction`.
   - Cover: urgency, impersonation (bank/CRA/support), pressure, money/verification requests, job scams, crypto/gift-card requests.

2. **Behavioral risk model**
   - Define `userContext` shape (e.g. `neverUsedCrypto`, `typicalContacts`, `knownDomains[]`).
   - In prompt or in a small layer: compare current request to context and add reasons like "Unusual for you: you have never sent cryptocurrency before."

3. **Explainability**
   - Every response includes clear `reasons` and a short `explanation` in plain language (no jargon) and `recommendedAction`.

4. **Optional: URL/domain check**
   - Integrate a phishing URL list or domain check (e.g. known-bad domains, homograph detection) and feed result into LLM or final score.

5. **Demo-ready behavior**
   - Ensure the 4 use cases (phishing site, scam message, fake payment, fake job) return the right risk level and explanations; add example prompts in `GAME_PLAN.md` or `docs/` if helpful.

**Deliverables:** `lib/ai.ts`, `lib/behavioral.ts`, optional `lib/phishing.ts`, and the analyze route logic that calls them and returns the agreed JSON.

---

### Person 2: Frontend

**Goal:** Web app to paste/upload content, show results, and (optional) manage profile.

**Tasks:**

1. **Main analyzer UI**
   - Input: paste text, paste URL, or upload image (screenshot).
   - Button: "Analyze" → call `POST /api/analyze` with the right `contentType` and payload.
   - Display: risk score, risk level (color/badge), list of reasons, explanation, recommended action (reuse `ResultCard`-style from extension if useful).

2. **Optional: user context for personalization**
   - Simple form or toggles: e.g. "I have never sent cryptocurrency", "My typical contacts are family and coworkers" → send as `userContext` in analyze request or save via `/api/profile`.

3. **Demo scenarios**
   - "Example scam message", "Example safe message", "Example phishing URL" buttons that prefill and run analysis (so demo is one-click).

4. **Styling & accessibility**
   - Clear typography, high contrast for warnings, mobile-friendly so it works on stage.

5. **Optional: heatmap**
   - If DB exposes `GET /api/heatmap`, show a simple map or list of "Reports by region".

**Deliverables:** `app/page.tsx`, `app/layout.tsx`, `components/AnalyzerForm.tsx`, `components/ResultCard.tsx`, optional profile UI and heatmap component.

---

### Person 3: Chrome Extension

**Goal:** "Analyze this page" and "Analyze selected text" from any tab; show same risk + explanation in popup.

**Tasks:**

1. **Popup**
   - "Analyze this page" → get current tab URL (and title); send `POST /api/analyze` with `contentType: "url"` and `url`.
   - "Analyze selected text" → get selection via `scripting.executeScript`; send `contentType: "text"` and `text`.
   - Display response: risk %, reasons, explanation, recommended action (reuse same structure as frontend for consistency).

2. **API base URL**
   - Configurable (e.g. in `popup.js` or a small options page) so it works with localhost and production (e.g. `NEXT_PUBLIC_APP_URL`).

3. **CORS**
   - Ensure backend allows requests from `chrome-extension://` (or document that deploy must allow extension origin).

4. **Optional: content script**
   - On known phishing-like pages or when user selects text, show a small inline hint ("ScamShield: check this") that opens popup or sends to analyze. (Lower priority than popup.)

5. **Demo**
   - Test with a fake phishing HTML page and a page with scammy text; ensure popup shows correct warnings for the 4 use cases.

**Deliverables:** `extension/manifest.json`, `extension/popup.html`, `extension/popup.js`, `extension/popup.css`, optional `content.js` and `extension/README.md` with load instructions.

---

### Person 4: Database

**Goal:** Store user profile (for personalization) and optional reports/heatmap.

**Tasks:**

1. **Schema**
   - **Profiles:** e.g. `user_id` (or anonymous id), `never_used_crypto`, `typical_contacts`, `known_domains[]`, `created_at`, `updated_at`.
   - **Reports:** e.g. `id`, `content_type`, `risk_level`, `risk_score`, `region` (optional), `created_at` (no PII; can be anonymous).

2. **DB choice**
   - Supabase (Postgres) or Vercel Postgres; create tables and (if needed) RLS for hackathon.

3. **API routes**
   - **GET/POST /api/profile** — read/update profile for current user (anonymous id in cookie or header is enough for demo).
   - **POST /api/report** — store one report (content_type, risk_level, risk_score, optional region).
   - **GET /api/heatmap** — aggregate reports by region (e.g. city/country) and return counts for map/list.

4. **Shared client**
   - `lib/db.ts` (or Supabase client) used by API routes; document env vars (`DATABASE_URL` or Supabase keys).

5. **Seeding (optional)**
   - Seed a few regions with fake counts so heatmap looks alive for demo.

**Deliverables:** Schema (migration or SQL in `docs/` or repo), `lib/db.ts`, `app/api/profile/route.ts`, `app/api/report/route.ts`, `app/api/heatmap/route.ts`, and `.env.example` with DB vars.

---

## Handoffs & Integration

| From | To | Contract |
|------|----|----------|
| ML | Frontend, Extension | Response shape of `POST /api/analyze` (riskLevel, riskScore, reasons, explanation, recommendedAction). |
| Frontend | Extension | Same result UI pattern so demo is consistent. |
| Database | ML / Frontend | `userContext` from profile for analyze; optional heatmap payload. |
| All | Demo | Agree on 4 scenarios and one script (see [Demo Plan](#demo-plan)). |

**Sync points:**  
- Kickoff: agree on API request/response and `userContext` shape.  
- Midway: integrate analyze + profile + extension with real backend.  
- Before demo: run through all 4 scenarios and fix CORS/env.

---

## Demo Plan

**Duration:** ~5 minutes.

1. **Hook (30 s)**  
   "We built an AI guardian that learns your behavior and protects you across messages, websites, and payments — for vulnerable communities most targeted by scams."

2. **Phishing website (1 min)**  
   Open fake banking page → Extension → "Analyze this page" → show warning + reasons + recommended action.

3. **Scam message (1 min)**  
   Paste "Send verification code urgently" (or select in a page) → Analyze → show scam pattern + explanation.

4. **Fake payment (1 min)**  
   Paste "Pay using crypto gift cards" → show "Unusual for you: you have never sent crypto" + recommended action.

5. **Optional: Fake job or heatmap (30 s)**  
   Quick job-scam example or heatmap of reports by region.

6. **Close (30 s)**  
   "Same protection across channels, with explanations in plain language. We want this in seniors’ centers and immigrant services."

Have a **backup**: short screen recording of the same flow if live API fails.

---

