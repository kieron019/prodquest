import { useCallback, useEffect, useMemo, useState } from "react";
import { SignedIn, SignedOut, SignInButton, UserButton, useAuth, useUser } from "@clerk/clerk-react";
import ProdQuestApp from "./ProdQuestV35";
import AdminConsole from "./AdminConsole";
import { startStripeCheckout } from "./lib/billing";
import { ensureUserProfile, saveSession } from "./lib/data";
import { env, flags } from "./lib/env";
import { supabase } from "./lib/supabaseClient";

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

function SupabaseAuthScreen({ onSignedIn }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSignUp, setIsSignUp] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState("");

  const submit = useCallback(
    async (e) => {
      e.preventDefault();
      setIsLoading(true);
      setMessage("");
      try {
        if (!supabase) throw new Error("Supabase is not configured");

        if (isSignUp) {
          const { data, error } = await supabase.auth.signUp({
            email,
            password,
            options: { emailRedirectTo: env.appUrl },
          });
          if (error) throw error;
          if (data.session) {
            onSignedIn(data.session);
            setMessage("Account created. You are signed in.");
          } else {
            setMessage("Account created. Check your email to verify before signing in.");
          }
        } else {
          const { data, error } = await supabase.auth.signInWithPassword({ email, password });
          if (error) throw error;
          onSignedIn(data.session);
        }
      } catch (err) {
        setMessage(err?.message || "Authentication failed");
      } finally {
        setIsLoading(false);
      }
    },
    [email, isSignUp, onSignedIn, password]
  );

  return (
    <div style={{ minHeight: "100vh", display: "grid", placeItems: "center", background: "#141210", color: "#ede8df", padding: 20 }}>
      <form
        onSubmit={submit}
        style={{ maxWidth: 520, width: "100%", border: "1px solid rgba(155,140,118,0.25)", borderRadius: 12, padding: 24, background: "#1f1d19" }}
      >
        <h1 style={{ margin: 0, fontSize: 32, lineHeight: 1.1 }}>ProdQuest</h1>
        <p style={{ marginTop: 12, marginBottom: 18, color: "#bdb4a8" }}>
          {isSignUp ? "Create your free account" : "Sign in to your free account"}
        </p>

        <div style={{ display: "grid", gap: 10 }}>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Email"
            required
            style={{ padding: "10px 12px", borderRadius: 8, border: "1px solid rgba(155,140,118,0.25)", background: "#141210", color: "#ede8df" }}
          />
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Password"
            minLength={6}
            required
            style={{ padding: "10px 12px", borderRadius: 8, border: "1px solid rgba(155,140,118,0.25)", background: "#141210", color: "#ede8df" }}
          />
        </div>

        <button
          type="submit"
          disabled={isLoading}
          style={{ marginTop: 14, padding: "10px 16px", borderRadius: 8, border: 0, cursor: "pointer", fontWeight: 600, width: "100%" }}
        >
          {isLoading ? "Please wait..." : isSignUp ? "Create Account" : "Sign In"}
        </button>

        <button
          type="button"
          onClick={() => setIsSignUp((v) => !v)}
          style={{ marginTop: 10, padding: "8px 10px", borderRadius: 8, border: "1px solid rgba(155,140,118,0.35)", background: "transparent", color: "#ede8df", cursor: "pointer", width: "100%" }}
        >
          {isSignUp ? "Have an account? Sign in" : "New here? Create account"}
        </button>

        {message ? <p style={{ marginTop: 10, color: "#bdb4a8", fontSize: 13 }}>{message}</p> : null}
      </form>
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

function SupabaseSignedInApp({ session, onSignedOut }) {
  const user = session?.user;
  const [view, setView] = useState(() => {
    if (typeof window === "undefined") return "app";
    const params = new URLSearchParams(window.location.search);
    return params.get("admin") === "1" ? "admin" : "app";
  });

  const initialUser = useMemo(() => {
    if (!user) return null;
    const displayName = user.user_metadata?.full_name || user.user_metadata?.name || user.email?.split("@")[0] || "ProdQuest User";
    const username = displayName.toLowerCase().replace(/\s+/g, "");
    return {
      id: user.id,
      name: displayName,
      handle: `@${username}`,
      email: user.email || "",
    };
  }, [user]);

  const onSessionLogged = useCallback(
    async (sessionPayload) => {
      if (!initialUser) return;
      await saveSession(initialUser.id, sessionPayload);
    },
    [initialUser]
  );

  useEffect(() => {
    if (!initialUser) return;
    ensureUserProfile(initialUser).catch(() => {});
  }, [initialUser]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const url = new URL(window.location.href);
    if (view === "admin") {
      url.searchParams.set("admin", "1");
    } else {
      url.searchParams.delete("admin");
    }
    window.history.replaceState({}, "", url.toString());
  }, [view]);

  const signOut = useCallback(async () => {
    if (!supabase) return;
    await supabase.auth.signOut();
    onSignedOut();
  }, [onSignedOut]);

  if (!initialUser) return null;

  if (view === "admin") {
    return <AdminConsole userId={initialUser.id} userEmail={initialUser.email} onBack={() => setView("app")} />;
  }

  return (
    <>
      <div style={{ position: "fixed", top: 10, right: 10, zIndex: 3000, display: "flex", gap: 8 }}>
        <button
          onClick={() => setView("admin")}
          style={{ padding: "8px 10px", borderRadius: 8, border: "1px solid rgba(155,140,118,0.35)", background: "#1f1d19", color: "#ede8df", cursor: "pointer" }}
        >
          Admin
        </button>
        <button
          onClick={signOut}
          style={{ padding: "8px 10px", borderRadius: 8, border: "1px solid rgba(155,140,118,0.35)", background: "#1f1d19", color: "#ede8df", cursor: "pointer" }}
        >
          Sign out
        </button>
      </div>
      <ProdQuestApp initialUser={initialUser} onSessionLogged={onSessionLogged} />
    </>
  );
}

function SupabaseApp() {
  const [session, setSession] = useState(null);
  const [isBooting, setIsBooting] = useState(true);

  useEffect(() => {
    let isMounted = true;
    if (!supabase) {
      setIsBooting(false);
      return;
    }

    supabase.auth.getSession().then(({ data }) => {
      if (!isMounted) return;
      setSession(data.session || null);
      setIsBooting(false);
    });

    const { data } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      if (!isMounted) return;
      setSession(nextSession || null);
    });

    return () => {
      isMounted = false;
      data.subscription.unsubscribe();
    };
  }, []);

  if (isBooting) {
    return <div style={{ minHeight: "100vh", display: "grid", placeItems: "center", background: "#141210", color: "#ede8df" }}>Loading...</div>;
  }

  if (!session) {
    return <SupabaseAuthScreen onSignedIn={setSession} />;
  }

  return <SupabaseSignedInApp session={session} onSignedOut={() => setSession(null)} />;
}

export default function App() {
  if (flags.hasClerk) {
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

  if (flags.useSupabaseAuth) {
    return <SupabaseApp />;
  }

  return <ProdQuestApp />;
}