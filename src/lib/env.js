export const env = {
  clerkPublishableKey: import.meta.env.VITE_CLERK_PUBLISHABLE_KEY || "",
  supabaseUrl: import.meta.env.VITE_SUPABASE_URL || "",
  supabaseAnonKey: import.meta.env.VITE_SUPABASE_ANON_KEY || "",
  appUrl: import.meta.env.VITE_APP_URL || "http://localhost:5173",
};

const hasClerk = Boolean(env.clerkPublishableKey);
const hasSupabase = Boolean(env.supabaseUrl && env.supabaseAnonKey);

export const flags = {
  hasClerk,
  hasSupabase,
  useSupabaseAuth: !hasClerk && hasSupabase,
  demoMode: !hasClerk && !hasSupabase,
};