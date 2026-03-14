# Using Watsonx.ai + Watson Discovery (IBM prize)

## What you need to use Watsonx (keys & setup)

1. **IBM Cloud / watsonx.ai access**  
   Go to [watsonx.ai Developer Access](https://dataplatform.cloud.ibm.com/developer-access?context=wx) (or [IBM Cloud](https://cloud.ibm.com) and enable the watsonx.ai service).

2. **Create or open a project**  
   In the watsonx.ai console, create a project or open an existing one. You need the **Project ID** (often a long GUID).

3. **Get an API key**  
   In IBM Cloud: **Manage** → **Access (IAM)** → **API keys** → **Create an IBM Cloud API key**. Copy the key (you won’t see it again).

4. **Add to `.env.local`** (no quotes, no spaces around `=`):
   ```env
   WATSONX_AI_AUTH_TYPE=iam
   WATSONX_AI_APIKEY=your_ibm_cloud_api_key_here
   WATSONX_PROJECT_ID=your_project_id_here
   ```
   Optional: `WATSONX_MODEL_ID=ibm/granite-13b-chat-v2` (default) or another model from the watsonx catalog.  
   Optional: `WATSONX_SERVICE_URL=https://us-south.ml.cloud.ibm.com` (change region if needed).

5. **Install and run**  
   Run `npm install` (installs `@ibm-cloud/watsonx-ai`). If Watsonx env vars are set, the app uses Watsonx first; otherwise it falls back to Gemini or OpenAI.

**Summary:** You need **WATSONX_AI_AUTH_TYPE=iam**, **WATSONX_AI_APIKEY**, and **WATSONX_PROJECT_ID**. Get the API key from IBM Cloud IAM and the Project ID from your watsonx.ai project.

---

## Is the scam logic hardcoded or LLM?

**Hybrid:**

- **LLM** does the main work: it **reads** the content (text/URL) and our **prompt** (which describes scam patterns like urgency, impersonation, crypto requests). The LLM then returns risk level, reasons, explanation, and action. So the “scam model” is **the prompt + the LLM’s reasoning**, not a fixed list of keywords.
- **Rule-based (hardcoded)** parts:
  - **`lib/behavioral.ts`** — e.g. “if message mentions crypto and user never used crypto → add hint.”
  - **`lib/phishing.ts`** — e.g. suspicious TLDs, phishy URL substrings.

Those rules produce **hints** that we feed into the LLM. The LLM still decides the final risk and writes the explanation. So: **LLM = main scam reader; rules = extra signals.**

---

## Watsonx.ai (LLM)

**Watsonx.ai** is IBM’s LLM platform (like Gemini/OpenAI). You can use it as the main analyzer for the IBM prize.

- **In this repo:** Set `WATSONX_AI_APIKEY` and `WATSONX_PROJECT_ID` in `.env.local`. The app will call Watsonx instead of (or in addition to) Gemini/OpenAI.
- **Advanced model:** In `lib/ai.ts` the Watsonx call uses a model ID (e.g. `ibm/granite-3-8b-instruct`). You can switch to a larger/finer model in the Watsonx catalog and change that ID.
- **SDK:** `@ibm-cloud/watsonx-ai` (optional dependency; install if you use Watsonx).

---

## Watson Discovery (scam patterns)

**Watson Discovery** is not an LLM; it’s **search over documents**. You can use it to feed “known scam patterns” into the LLM:

1. **Ingest** known scam examples, threat bulletins, or red-flag phrases into a Discovery collection.
2. **Query** Discovery with the user’s message (e.g. “find documents similar to this text” or a keyword query).
3. **Pass** the retrieved snippets or patterns into the **LLM prompt** (e.g. “Known scam patterns that may relate: …”).
4. The **LLM** (Watsonx or another) then reads the content + those patterns and returns risk + explanation.

So: **Discovery = retrieve known scam patterns; LLM = read content + those patterns and judge.** That’s how you combine “Watson Discovery for scam patterns” with “Watsonx as the LLM” for the IBM prize.

This repo doesn’t implement Discovery yet; it’s a good next step for branch 1 (e.g. a small `lib/discovery.ts` that queries your collection and returns text to add to the prompt).
