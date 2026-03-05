import Stripe from "stripe";
import { readJsonBody } from "../_lib/readBody.js";
import { requireClerkUser } from "../_lib/auth.js";

const stripeSecretKey = process.env.STRIPE_SECRET_KEY;
const stripePriceIdProMonthly = process.env.STRIPE_PRICE_ID_PRO_MONTHLY;
const appUrl = process.env.APP_URL || "http://localhost:5173";

if (!stripeSecretKey || !stripePriceIdProMonthly) {
  throw new Error("Missing STRIPE_SECRET_KEY or STRIPE_PRICE_ID_PRO_MONTHLY");
}

const stripe = new Stripe(stripeSecretKey, {
  apiVersion: "2025-02-24.acacia",
});

export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const authedUserId = await requireClerkUser(req);
    const body = await readJsonBody(req);
    const clerkUserId = body.clerkUserId || undefined;
    const email = body.email || undefined;
    const handle = body.handle || undefined;
    if (!clerkUserId || clerkUserId !== authedUserId) {
      return res.status(403).json({ error: "Forbidden" });
    }

    const session = await stripe.checkout.sessions.create({
      mode: "subscription",
      line_items: [{ price: stripePriceIdProMonthly, quantity: 1 }],
      success_url: `${appUrl}/?checkout=success`,
      cancel_url: `${appUrl}/?checkout=cancelled`,
      customer_email: email,
      metadata: {
        clerkUserId: clerkUserId || "",
        handle: handle || "",
      },
      subscription_data: {
        metadata: {
          clerkUserId: clerkUserId || "",
          handle: handle || "",
        },
      },
      allow_promotion_codes: true,
    });

    return res.status(200).json({ url: session.url });
  } catch (error) {
    return res.status(500).json({ error: error.message || "Checkout failed" });
  }
}
