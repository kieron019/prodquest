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
    if (!body.id) return res.status(400).json({ error: "Missing user id" });
    if (body.id !== authedUserId) return res.status(403).json({ error: "Forbidden" });

    const { error } = await supabaseAdmin.from("app_users").upsert(
      {
        clerk_user_id: body.id,
        email: body.email || null,
        display_name: body.name || null,
        handle: body.handle || null,
        updated_at: new Date().toISOString(),
      },
      {
        onConflict: "clerk_user_id",
        ignoreDuplicates: false,
      }
    );

    if (error) throw error;
    return res.status(200).json({ ok: true });
  } catch (error) {
    return res.status(500).json({ error: error.message || "Upsert failed" });
  }
}
