import { readJsonBody } from "../_lib/readBody.js";
import { supabaseAdmin } from "../_lib/supabaseAdmin.js";
import { requireClerkUser } from "../_lib/auth.js";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const authedUserId = await requireClerkUser(req);
    const body = await readJsonBody(req);
    const clerkUserId = body.clerkUserId;
    const session = body.sessionPayload;

    if (!clerkUserId || !session) {
      return res.status(400).json({ error: "Missing payload" });
    }
    if (clerkUserId !== authedUserId) {
      return res.status(403).json({ error: "Forbidden" });
    }

    const { error } = await supabaseAdmin.from("focus_sessions").insert({
      clerk_user_id: clerkUserId,
      category: session.cat,
      duration_minutes: session.dur,
      description: session.desc,
      proof_score: session.ps,
      score: session.score,
      ai_summary: session.aiSummary,
      created_at: new Date().toISOString(),
    });

    if (error) throw error;
    return res.status(200).json({ ok: true });
  } catch (error) {
    return res.status(500).json({ error: error.message || "Insert failed" });
  }
}
