import { NextResponse } from "next/server";
import { supabase } from "@/lib/db";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const user_id = searchParams.get("user_id");

    if (!user_id) {
      return NextResponse.json(
        { error: "Missing user_id" },
        { status: 400 }
      );
    }

    // behavior profile
    const { data: profile, error: profileError } = await supabase
      .from("user_behavior_profile")
      .select("*")
      .eq("user_id", user_id)
      .single();

    if (profileError) {
      return NextResponse.json(
        { error: profileError.message },
        { status: 500 }
      );
    }

    // known domains
    const { data: domains } = await supabase
      .from("user_known_domains")
      .select("domain")
      .eq("user_id", user_id);

    // trusted contacts
    const { data: contacts } = await supabase
      .from("trusted_contacts")
      .select("contact_name")
      .eq("user_id", user_id);

    const userContext = {
      ...profile,
      known_domains: domains?.map(d => d.domain) || [],
      trusted_contacts: contacts?.map(c => c.contact_name) || []
    };

    return NextResponse.json(userContext);

  } catch (err) {
    return NextResponse.json(
      { error: "Failed to fetch profile" },
      { status: 500 }
    );
  }
}