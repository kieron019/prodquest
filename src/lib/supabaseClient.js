import { createClient } from "@supabase/supabase-js";
import { env } from "./env";

const hasSupabaseConfig = Boolean(env.supabaseUrl && env.supabaseAnonKey);

export const supabase = hasSupabaseConfig
  ? createClient(env.supabaseUrl, env.supabaseAnonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
      },
    })
  : null;