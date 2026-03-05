import { useCallback, useEffect, useMemo } from "react";
import { SignedIn, SignedOut, SignInButton, UserButton, useAuth, useUser } from "@clerk/clerk-react";
import ProdQuestApp from "./ProdQuestV35";
import { startStripeCheckout } from "./lib/billing";
import { ensureUserProfile, saveSession } from "./lib/data";

function AuthScreen() {
  return (
    <div style={{ minHeight: "100vh", display: "grid", placeItems: "center", background: "#141210", color: "#ede8df", padding: 20 }}>
      <div style={{ maxWidth: 520, width: "100%", border: "1px solid rgba(155,140,118,0.25)", borderRadius: 12, padding: 24, background: "#1f1d19" }}>
        <h1 style={{ margin: 0, fontSize: 32, lineHeight: 1.1 }}>ProdQuest</h1>
        <p style={{ marginTop: 12, marginBottom: 18, color: "#bdb4a8" }}>
          Sign in to start tracking sessions, save progress to Supabase, and upgrade to Pro.
        </p>
        <SignInButton mode="modal">
          <button style={{ padding: "10px 16px", borderRadius: 8, border: 0, cursor: "pointer", fontWeight: 600 }}>
            Sign In
          </button>
        </SignInButton>
      </div>
    </div>
  );
}

function SignedInApp() {
  const { user } = useUser();
  const { getToken } = useAuth();

  const initialUser = useMemo(() => {
    if (!user) return null;
    return {
      id: user.id,
      name: user.fullName || user.firstName || "ProdQuest User",
      handle: user.username ? `@${user.username}` : `@${(user.firstName || "user").toLowerCase().replace(/\s+/g, "")}`,
      email: user.primaryEmailAddress?.emailAddress || "",
    };
  }, [user]);

  const onUpgradeToPro = useCallback(async () => {
    const checkoutUrl = await startStripeCheckout(initialUser, getToken);
    window.location.assign(checkoutUrl);
  }, [initialUser, getToken]);

  const onSessionLogged = useCallback(
    async (sessionPayload) => {
      if (!initialUser) return;
      await saveSession(initialUser.id, sessionPayload, getToken);
    },
    [initialUser, getToken]
  );

  useEffect(() => {
    if (!initialUser) return;
    ensureUserProfile(initialUser, getToken).catch(() => {});
  }, [initialUser, getToken]);

  if (!initialUser) return null;

  return (
    <>
      <div style={{ position: "fixed", top: 10, right: 10, zIndex: 3000 }}>
        <UserButton afterSignOutUrl="/" />
      </div>
      <ProdQuestApp initialUser={initialUser} onUpgradeToPro={onUpgradeToPro} onSessionLogged={onSessionLogged} />
    </>
  );
}

export default function App() {
  return (
    <>
      <SignedOut>
        <AuthScreen />
      </SignedOut>
      <SignedIn>
        <SignedInApp />
      </SignedIn>
    </>
  );
}
