"use client";

import { useState } from "react";

export default function Home() {
  const [contentType, setContentType] = useState<"text" | "url">("text");
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{
    riskLevel: string;
    riskScore: number;
    reasons: string[];
    explanation: string;
    recommendedAction: string;
  } | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setResult(null);
    try {
      const res = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contentType,
          text: contentType === "text" ? text : undefined,
          url: contentType === "url" ? text : undefined,
          userContext: { neverUsedCrypto: true },
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Request failed");
      setResult(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main style={{ maxWidth: 600, margin: "2rem auto", padding: "0 1rem", fontFamily: "system-ui" }}>
      <h1>ScamShield — ML / Analyze</h1>
      <p>Test the analyze API. Set <code>GEMINI_API_KEY</code> or <code>OPENAI_API_KEY</code> in <code>.env.local</code>.</p>
      <form onSubmit={handleSubmit}>
        <div>
          <label>
            <input
              type="radio"
              checked={contentType === "text"}
              onChange={() => setContentType("text")}
            />{" "}
            Text
          </label>
          <label style={{ marginLeft: "1rem" }}>
            <input
              type="radio"
              checked={contentType === "url"}
              onChange={() => setContentType("url")}
            />{" "}
            URL
          </label>
        </div>
        <div style={{ marginTop: "0.5rem" }}>
          <textarea
            placeholder={contentType === "url" ? "https://..." : "Paste message or content..."}
            value={text}
            onChange={(e) => setText(e.target.value)}
            rows={4}
            style={{ width: "100%", boxSizing: "border-box" }}
          />
        </div>
        <button type="submit" disabled={loading} style={{ marginTop: "0.5rem" }}>
          {loading ? "Analyzing…" : "Analyze"}
        </button>
      </form>
      {error && <p style={{ color: "crimson" }}>{error}</p>}
      {result && (
        <div style={{ marginTop: "1.5rem", padding: "1rem", border: "1px solid #ccc", borderRadius: 8 }}>
          <p><strong>Risk:</strong> {result.riskLevel} ({result.riskScore}/100)</p>
          <p><strong>Reasons:</strong> {result.reasons.join("; ")}</p>
          <p><strong>Explanation:</strong> {result.explanation}</p>
          <p><strong>Action:</strong> {result.recommendedAction}</p>
        </div>
      )}
    </main>
  );
}
