import { supabase } from "./db";

export async function getUserContext(userId: string) {
  const { data: profile } = await supabase
    .from("user_behavior_profile")
    .select("*")
    .eq("user_id", userId)
    .single();

  const { data: domains } = await supabase
    .from("user_known_domains")
    .select("domain")
    .eq("user_id", userId);

  const { data: contacts } = await supabase
    .from("trusted_contacts")
    .select("contact_name")
    .eq("user_id", userId);

  return {
    neverUsedCrypto: profile?.never_used_crypto ?? false,
    neverSentGiftCards: profile?.never_sent_giftcards ?? false,
    knownDomains: domains?.map(d => d.domain) ?? [],
    typicalContacts: contacts?.map(c => c.contact_name) ?? []
  };
}