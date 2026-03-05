export async function ensureUserProfile(user, getToken) {
  const token = getToken ? await getToken() : null;
  const res = await fetch("/api/users/upsert", {
    method: "POST",
    headers: {
      "content-type": "application/json",
      ...(token ? { authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify(user),
  });
  if (!res.ok) throw new Error("Profile sync failed");
}

export async function saveSession(clerkUserId, sessionPayload, getToken) {
  const token = getToken ? await getToken() : null;
  const res = await fetch("/api/sessions/create", {
    method: "POST",
    headers: {
      "content-type": "application/json",
      ...(token ? { authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify({
      clerkUserId,
      sessionPayload,
    }),
  });
  if (!res.ok) throw new Error("Session sync failed");
}
