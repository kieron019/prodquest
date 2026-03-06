import { flags } from "./env";
import { supabase } from "./supabaseClient";

export async function ensureUserProfile(user, getToken) {
  if (getToken) {
    const token = await getToken();
    const res = await fetch("/api/users/upsert", {
      method: "POST",
      headers: {
        "content-type": "application/json",
        ...(token ? { authorization: `Bearer ${token}` } : {}),
      },
      body: JSON.stringify(user),
    });
    if (!res.ok) throw new Error("Profile sync failed");
    return;
  }

  if (flags.hasSupabase && supabase) {
    const { error } = await supabase.from("app_users").upsert(
      {
        clerk_user_id: user.id,
        email: user.email || null,
        display_name: user.name || null,
        handle: user.handle || null,
      },
      { onConflict: "clerk_user_id" }
    );
    if (error) throw error;
    return;
  }

  throw new Error("No auth provider available");
}

export async function saveSession(userId, sessionPayload, getToken) {
  if (getToken) {
    const token = await getToken();
    const res = await fetch("/api/sessions/create", {
      method: "POST",
      headers: {
        "content-type": "application/json",
        ...(token ? { authorization: `Bearer ${token}` } : {}),
      },
      body: JSON.stringify({
        clerkUserId: userId,
        sessionPayload,
      }),
    });
    if (!res.ok) throw new Error("Session sync failed");
    return;
  }

  if (flags.hasSupabase && supabase) {
    const row = {
      clerk_user_id: userId,
      category: sessionPayload.cat || "Deep Work",
      duration_minutes: Math.max(1, Number(sessionPayload.dur) || 1),
      description: sessionPayload.desc || "",
      proof_score: Number(sessionPayload.ps) || 0,
      score: Number(sessionPayload.score) || 0,
      ai_summary: sessionPayload.aiSummary || null,
    };

    const { error } = await supabase.from("focus_sessions").insert(row);
    if (error) throw error;
    return;
  }

  throw new Error("No auth provider available");
}