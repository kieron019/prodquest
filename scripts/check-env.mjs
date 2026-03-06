import fs from "node:fs";
import path from "node:path";

const required = [
  "VITE_APP_URL",
  "VITE_CLERK_PUBLISHABLE_KEY",
  "VITE_SUPABASE_URL",
  "VITE_SUPABASE_ANON_KEY",
  "APP_URL",
  "CLERK_SECRET_KEY",
  "SUPABASE_URL",
  "SUPABASE_SERVICE_ROLE_KEY",
  "STRIPE_SECRET_KEY",
  "STRIPE_WEBHOOK_SECRET",
  "STRIPE_PRICE_ID_PRO_MONTHLY",
];

function parseDotEnv(content) {
  const out = {};
  const lines = content.split(/\r?\n/);
  for (const raw of lines) {
    const line = raw.trim();
    if (!line || line.startsWith("#")) continue;
    const i = line.indexOf("=");
    if (i < 0) continue;
    const key = line.slice(0, i).trim();
    const value = line.slice(i + 1).trim();
    out[key] = value;
  }
  return out;
}

const envLocalPath = path.resolve(process.cwd(), ".env.local");
let fileVars = {};
if (fs.existsSync(envLocalPath)) {
  fileVars = parseDotEnv(fs.readFileSync(envLocalPath, "utf8"));
}

const missing = [];
for (const key of required) {
  const value = process.env[key] ?? fileVars[key] ?? "";
  if (!String(value).trim()) missing.push(key);
}

if (missing.length) {
  console.log("Missing required env vars:");
  for (const key of missing) console.log(`- ${key}`);
  process.exit(1);
}

console.log("All required env vars are set.");