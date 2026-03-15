/**
 * ScamShield — URL/domain risk check.
 * Simple heuristics: homograph-style patterns, known bad keywords, suspicious TLDs.
 * Can be extended with blocklists or external APIs.
 */

export interface PhishingSignal {
  reason: string;
  severity: "low" | "medium" | "high";
}

// TLDs often used in phishing (short list; extend with blocklist in production)
const SUSPICIOUS_TLDS = new Set([
  "tk", "ml", "ga", "cf", "gq", "xyz", "top", "work", "click", "link", "info", "buzz", "rest", "cc", "ws",
]);

// Substrings that often appear in phishing URLs (not exhaustive)
const PHISHY_PATTERNS = [
  { pattern: /login[-.]?secure|account[-.]?verify|verify[-.]?bank|banking[-.]?login/i, reason: "Fake login/verification URL pattern" },
  { pattern: /paypal[-.]?secure|amazon[-.]?account|apple[-.]?verify|microsoft[-.]?login/i, reason: "Brand impersonation in URL" },
  { pattern: /free[-.]?gift|winner|claim[-.]?prize|urgent[-.]?action/i, reason: "Prize/urgency phishing pattern" },
  { pattern: /[\u0400-\u04FF]/, reason: "Cyrillic characters (homograph risk)" },
  { pattern: /[\u4e00-\u9fff]/, reason: "CJK characters in URL (homograph risk)" },
];

/**
 * Check a URL for simple phishing/heuristic signals.
 * Returns a list of signals; the LLM or scorer can use these to adjust risk.
 */
export function checkUrlSignals(urlString: string): PhishingSignal[] {
  const signals: PhishingSignal[] = [];
  const lower = urlString.toLowerCase().trim();

  try {
    const u = new URL(urlString);
    const host = u.hostname;

    // Suspicious TLD
    const tld = host.split(".").pop() ?? "";
    if (SUSPICIOUS_TLDS.has(tld)) {
      signals.push({ reason: `Suspicious TLD: .${tld} is often used in phishing`, severity: "medium" });
    }

    // Long or random-looking host (e.g. subdomains)
    const labels = host.split(".");
    if (labels.length > 3) {
      signals.push({ reason: "Unusually many subdomains (can hide real domain)", severity: "low" });
    }

    // Phishy substrings in full URL
    for (const { pattern, reason } of PHISHY_PATTERNS) {
      if (pattern.test(lower)) {
        signals.push({ reason, severity: "high" });
      }
    }
  } catch {
    signals.push({ reason: "Invalid or malformed URL", severity: "medium" });
  }

  return signals;
}

/**
 * Summarize URL signals into short strings for the LLM prompt.
 */
export function getPhishingHintLines(urlString: string): string[] {
  const signals = checkUrlSignals(urlString);
  return signals.map((s) => `[URL check] ${s.reason} (${s.severity})`);
}
