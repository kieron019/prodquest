export async function startStripeCheckout(user, getToken) {
  const token = getToken ? await getToken() : null;
  const res = await fetch("/api/stripe/create-checkout-session", {
    method: "POST",
    headers: {
      "content-type": "application/json",
      ...(token ? { authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify({
      clerkUserId: user?.id || null,
      email: user?.email || null,
      handle: user?.handle || null,
    }),
  });

  if (!res.ok) {
    throw new Error("Unable to create checkout session");
  }

  const data = await res.json();
  if (!data.url) {
    throw new Error("Checkout URL missing from API response");
  }
  return data.url;
}
