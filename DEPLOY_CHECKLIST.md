# ProdQuest Launch Checklist

## 1. Supabase

1. Create a Supabase project.
2. Run SQL from `supabase/schema.sql` in the SQL editor.
3. Copy these values:
   - `Project URL` -> `SUPABASE_URL` and `VITE_SUPABASE_URL`
   - `anon public key` -> `VITE_SUPABASE_ANON_KEY`
   - `service_role key` -> `SUPABASE_SERVICE_ROLE_KEY`

## 2. Clerk

1. Create a Clerk application.
2. Enable your desired sign-in methods (email/social).
3. Copy:
   - Publishable key -> `VITE_CLERK_PUBLISHABLE_KEY`
   - Secret key -> `CLERK_SECRET_KEY`

## 3. Stripe

1. Create a product called `ProdQuest Pro`.
2. Create a recurring monthly price and copy the price id -> `STRIPE_PRICE_ID_PRO_MONTHLY`.
3. Copy secret key -> `STRIPE_SECRET_KEY`.
4. Create webhook endpoint:
   - Local: `http://localhost:5173/api/stripe/webhook` (via `vercel dev`) or tunnel
   - Production: `https://YOUR_DOMAIN/api/stripe/webhook`
5. Subscribe these events:
   - `checkout.session.completed`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
6. Copy webhook signing secret -> `STRIPE_WEBHOOK_SECRET`.

## 4. Vercel Environment Variables

Set all values from `.env.example` in Vercel Project -> Settings -> Environment Variables.

Required in production:
- `VITE_APP_URL`
- `VITE_CLERK_PUBLISHABLE_KEY`
- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`
- `APP_URL`
- `CLERK_SECRET_KEY`
- `SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY`
- `STRIPE_SECRET_KEY`
- `STRIPE_WEBHOOK_SECRET`
- `STRIPE_PRICE_ID_PRO_MONTHLY`

`APP_URL` and `VITE_APP_URL` should match your deployed origin.


Run 
pm run check:env locally to confirm all required keys are set before deploy.

## 5. Deploy

1. Push repo to GitHub.
2. Import project in Vercel.
3. Build command: `npm run build`
4. Output directory: `dist`
5. Deploy.

## 6. Smoke test

1. Sign up/sign in with Clerk.
2. Log a focus session and verify row appears in `focus_sessions`.
3. Click `Upgrade to Pro` and complete test checkout.
4. Confirm `app_users.is_pro` flips to `true`.
