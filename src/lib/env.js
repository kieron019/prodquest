const required = (name) => {
  const value = import.meta.env[name];
  if (!value) {
    throw new Error(`Missing environment variable: ${name}`);
  }
  return value;
};

export const env = {
  clerkPublishableKey: required("VITE_CLERK_PUBLISHABLE_KEY"),
  supabaseUrl: required("VITE_SUPABASE_URL"),
  supabaseAnonKey: required("VITE_SUPABASE_ANON_KEY"),
  appUrl: import.meta.env.VITE_APP_URL || "http://localhost:5173",
};
