import Stripe from "stripe";
import { readRawBody } from "../_lib/readBody.js";
import { supabaseAdmin } from "../_lib/supabaseAdmin.js";

const stripeSecretKey = process.env.STRIPE_SECRET_KEY;
const stripeWebhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

if (!stripeSecretKey || !stripeWebhookSecret) {
  throw new Error("Missing STRIPE_SECRET_KEY or STRIPE_WEBHOOK_SECRET");
}

const stripe = new Stripe(stripeSecretKey, {
  apiVersion: "2025-02-24.acacia",
});

async function setProStatus({ clerkUserId, isPro, customerId, subscriptionStatus }) {
  if (!clerkUserId) return;
  const { error } = await supabaseAdmin
    .from("app_users")
    .update({
      is_pro: isPro,
      stripe_customer_id: customerId || null,
      stripe_subscription_status: subscriptionStatus || null,
      updated_at: new Date().toISOString(),
    })
    .eq("clerk_user_id", clerkUserId);

  if (error) throw error;
}

export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).send("Method not allowed");
  }

  try {
    const signature = req.headers["stripe-signature"];
    const rawBody = await readRawBody(req);

    const event = stripe.webhooks.constructEvent(rawBody, signature, stripeWebhookSecret);

    if (event.type === "checkout.session.completed") {
      const session = event.data.object;
      await setProStatus({
        clerkUserId: session.metadata?.clerkUserId,
        isPro: true,
        customerId: session.customer,
        subscriptionStatus: "active",
      });
    }

    if (event.type === "customer.subscription.updated" || event.type === "customer.subscription.deleted") {
      const subscription = event.data.object;
      const activeStatuses = new Set(["active", "trialing", "past_due"]);
      await setProStatus({
        clerkUserId: subscription.metadata?.clerkUserId,
        isPro: activeStatuses.has(subscription.status),
        customerId: subscription.customer,
        subscriptionStatus: subscription.status,
      });
    }

    return res.status(200).json({ received: true });
  } catch (error) {
    return res.status(400).send(`Webhook Error: ${error.message}`);
  }
}
