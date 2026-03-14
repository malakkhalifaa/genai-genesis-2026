/**
 * ScamShield — Behavioral risk signals and user context.
 * Compares the current request to the user's profile to add personalized risk reasons.
 */

import type { UserContext } from "./ai";

export type { UserContext };

/**
 * User context shape used across the app and API.
 * Stored in DB by profile owner; passed into analyze as userContext.
 */
export interface UserProfile {
  userId?: string;
  neverUsedCrypto?: boolean;
  neverSentGiftCards?: boolean;
  typicalContacts?: string[];
  knownDomains?: string[];
  locale?: string;
  updatedAt?: string;
}

/**
 * Given the current analyze input and user context, return short reason strings
 * to be merged into the LLM prompt (e.g. "Unusual for you: you have never sent cryptocurrency.").
 */
export function getBehavioralHints(
  input: { contentType: string; text?: string; url?: string },
  userContext?: UserContext | null
): string[] {
  const hints: string[] = [];
  if (!userContext) return hints;

  const text = (input.text ?? "").toLowerCase();
  const url = (input.url ?? "").toLowerCase();

  // Crypto
  if (userContext.neverUsedCrypto && /crypto|bitcoin|ether|usdt|wallet|send (me )?(\d+ )?(btc|eth)/i.test(text)) {
    hints.push("Unusual for you: you have never used cryptocurrency. Scammers often request crypto.");
  }
  if (userContext.neverUsedCrypto && /crypto|bitcoin|ether|usdt|wallet/i.test(url)) {
    hints.push("Unusual for you: you have never used cryptocurrency. This link may be a crypto scam.");
  }

  // Gift cards
  if (userContext.neverSentGiftCards && /gift card|itunes|amazon card|google play card|pay with gift/i.test(text)) {
    hints.push("Unusual for you: you have never sent gift cards as payment. Scammers often request gift cards.");
  }

  // Domain mismatch: if user has known domains and the URL is not from one of them
  if (userContext.knownDomains?.length && input.contentType === "url" && url) {
    try {
      const host = new URL(input.url!).hostname.toLowerCase();
      const isKnown = userContext.knownDomains.some(
        (d) => host === d.toLowerCase() || host.endsWith("." + d.toLowerCase())
      );
      if (!isKnown) {
        hints.push("This domain is not in your list of known safe sites. Verify it is the real organization.");
      }
    } catch {
      hints.push("URL could not be parsed. Be cautious with unknown links.");
    }
  }

  return hints;
}
