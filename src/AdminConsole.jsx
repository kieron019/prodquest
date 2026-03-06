import { useCallback, useEffect, useMemo, useState } from "react";
import { supabase } from "./lib/supabaseClient";

const shellStyle = {
  minHeight: "100vh",
  background: "#141210",
  color: "#ede8df",
  padding: 20,
};

const cardStyle = {
  border: "1px solid rgba(155,140,118,0.25)",
  borderRadius: 12,
  background: "#1f1d19",
  padding: 16,
};

const inputStyle = {
  padding: "10px 12px",
  borderRadius: 8,
  border: "1px solid rgba(155,140,118,0.25)",
  background: "#141210",
  color: "#ede8df",
  width: "100%",
};

const buttonStyle = {
  padding: "10px 12px",
  borderRadius: 8,
  border: "1px solid rgba(155,140,118,0.35)",
  background: "#1f1d19",
  color: "#ede8df",
  cursor: "pointer",
};

function StatCard({ label, value, sub }) {
  return (
    <div style={cardStyle}>
      <div style={{ color: "#bdb4a8", fontSize: 12 }}>{label}</div>
      <div style={{ fontSize: 28, fontWeight: 700, marginTop: 6 }}>{value}</div>
      {sub ? <div style={{ marginTop: 4, color: "#8a8278", fontSize: 12 }}>{sub}</div> : null}
    </div>
  );
}

function formatDateTime(value) {
  if (!value) return "-";
  const d = new Date(value);
  return d.toLocaleString();
}

export default function AdminConsole({ userId, userEmail, onBack }) {
  const [isChecking, setIsChecking] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [error, setError] = useState("");

  const [metrics, setMetrics] = useState({
    totalUsers: 0,
    totalSessions: 0,
    activeUsers7d: 0,
    totalMinutes7d: 0,
    sessionsByDay: [],
    recentSessions: [],
  });

  const [events, setEvents] = useState([]);
  const [isLoadingData, setIsLoadingData] = useState(false);
  const [isSavingEvent, setIsSavingEvent] = useState(false);

  const [form, setForm] = useState({
    name: "",
    description: "",
    startAt: "",
    endAt: "",
    status: "upcoming",
  });

  const checkAdmin = useCallback(async () => {
    setError("");
    setIsChecking(true);
    try {
      if (!supabase) throw new Error("Supabase is not configured");
      const { data, error: profileErr } = await supabase
        .from("app_users")
        .select("is_admin")
        .eq("clerk_user_id", userId)
        .maybeSingle();
      if (profileErr) throw profileErr;
      setIsAdmin(Boolean(data?.is_admin));
    } catch (err) {
      setError(err?.message || "Unable to verify admin access");
    } finally {
      setIsChecking(false);
    }
  }, [userId]);

  const loadData = useCallback(async () => {
    setError("");
    setIsLoadingData(true);
    try {
      if (!supabase) throw new Error("Supabase is not configured");

      const since = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();

      const [usersCountRes, sessionsCountRes, sessions7dRes, eventsRes] = await Promise.all([
        supabase.from("app_users").select("clerk_user_id", { count: "exact", head: true }),
        supabase.from("focus_sessions").select("id", { count: "exact", head: true }),
        supabase
          .from("focus_sessions")
          .select("id, clerk_user_id, duration_minutes, category, created_at")
          .gte("created_at", since)
          .order("created_at", { ascending: false })
          .limit(500),
        supabase.from("admin_events").select("*").order("start_at", { ascending: false }).limit(100),
      ]);

      if (usersCountRes.error) throw usersCountRes.error;
      if (sessionsCountRes.error) throw sessionsCountRes.error;
      if (sessions7dRes.error) throw sessions7dRes.error;
      if (eventsRes.error) throw eventsRes.error;

      const sessions7d = sessions7dRes.data || [];
      const byUser = new Set();
      let totalMinutes7d = 0;

      const dayMap = new Map();
      for (let i = 6; i >= 0; i -= 1) {
        const d = new Date();
        d.setHours(0, 0, 0, 0);
        d.setDate(d.getDate() - i);
        const key = d.toISOString().slice(0, 10);
        dayMap.set(key, 0);
      }

      sessions7d.forEach((row) => {
        byUser.add(row.clerk_user_id);
        totalMinutes7d += Number(row.duration_minutes || 0);
        const key = String(row.created_at || "").slice(0, 10);
        if (dayMap.has(key)) dayMap.set(key, dayMap.get(key) + Number(row.duration_minutes || 0));
      });

      const sessionsByDay = Array.from(dayMap.entries()).map(([day, minutes]) => ({ day, minutes }));

      setMetrics({
        totalUsers: usersCountRes.count || 0,
        totalSessions: sessionsCountRes.count || 0,
        activeUsers7d: byUser.size,
        totalMinutes7d,
        sessionsByDay,
        recentSessions: sessions7d.slice(0, 10),
      });
      setEvents(eventsRes.data || []);
    } catch (err) {
      setError(err?.message || "Failed to load admin data");
    } finally {
      setIsLoadingData(false);
    }
  }, []);

  useEffect(() => {
    checkAdmin();
  }, [checkAdmin]);

  useEffect(() => {
    if (!isAdmin) return;
    loadData();
  }, [isAdmin, loadData]);

  const createEvent = useCallback(
    async (e) => {
      e.preventDefault();
      setError("");
      setIsSavingEvent(true);
      try {
        if (!form.name.trim()) throw new Error("Event name is required");
        if (!form.startAt || !form.endAt) throw new Error("Start and end time are required");
        if (new Date(form.endAt) <= new Date(form.startAt)) throw new Error("End time must be after start time");

        const { error: insertErr } = await supabase.from("admin_events").insert({
          name: form.name.trim(),
          description: form.description.trim() || null,
          start_at: new Date(form.startAt).toISOString(),
          end_at: new Date(form.endAt).toISOString(),
          status: form.status,
          created_by: userId,
        });
        if (insertErr) throw insertErr;

        setForm({ name: "", description: "", startAt: "", endAt: "", status: "upcoming" });
        await loadData();
      } catch (err) {
        setError(err?.message || "Unable to create event");
      } finally {
        setIsSavingEvent(false);
      }
    },
    [form, loadData, userId]
  );

  const setEventStatus = useCallback(
    async (eventId, status) => {
      setError("");
      try {
        const { error: updateErr } = await supabase
          .from("admin_events")
          .update({ status, updated_at: new Date().toISOString() })
          .eq("id", eventId);
        if (updateErr) throw updateErr;
        await loadData();
      } catch (err) {
        setError(err?.message || "Unable to update event");
      }
    },
    [loadData]
  );

  const sessionsByDayText = useMemo(() => {
    if (!metrics.sessionsByDay.length) return "No activity in the last 7 days.";
    return metrics.sessionsByDay.map((x) => `${x.day}: ${x.minutes}m`).join(" | ");
  }, [metrics.sessionsByDay]);

  if (isChecking) {
    return <div style={{ ...shellStyle, display: "grid", placeItems: "center" }}>Checking admin access...</div>;
  }

  if (!isAdmin) {
    return (
      <div style={{ ...shellStyle, display: "grid", placeItems: "center" }}>
        <div style={{ ...cardStyle, maxWidth: 760 }}>
          <h2 style={{ marginTop: 0 }}>Admin access required</h2>
          <p style={{ color: "#bdb4a8" }}>
            Your account ({userEmail || userId}) is not marked as admin yet.
          </p>
          <p style={{ color: "#bdb4a8" }}>Run this once in Supabase SQL editor:</p>
          <pre style={{ whiteSpace: "pre-wrap", background: "#141210", border: "1px solid rgba(155,140,118,0.25)", padding: 12, borderRadius: 8 }}>
{`update public.app_users
set is_admin = true
where clerk_user_id = '${userId}';`}
          </pre>
          {error ? <p style={{ color: "#ff8f8f" }}>{error}</p> : null}
          <button onClick={onBack} style={buttonStyle}>Back to app</button>
        </div>
      </div>
    );
  }

  return (
    <div style={shellStyle}>
      <div style={{ maxWidth: 1100, margin: "0 auto", display: "grid", gap: 16 }}>
        <div style={{ display: "flex", gap: 10, justifyContent: "space-between", alignItems: "center", flexWrap: "wrap" }}>
          <h1 style={{ margin: 0 }}>ProdQuest Admin</h1>
          <div style={{ display: "flex", gap: 8 }}>
            <button onClick={loadData} style={buttonStyle} disabled={isLoadingData}>Refresh</button>
            <button onClick={onBack} style={buttonStyle}>Back to app</button>
          </div>
        </div>

        {error ? <div style={{ ...cardStyle, color: "#ff8f8f" }}>{error}</div> : null}

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 12 }}>
          <StatCard label="Total Users" value={metrics.totalUsers} />
          <StatCard label="Total Sessions" value={metrics.totalSessions} />
          <StatCard label="Active Users (7d)" value={metrics.activeUsers7d} />
          <StatCard label="Minutes Logged (7d)" value={metrics.totalMinutes7d} />
        </div>

        <div style={cardStyle}>
          <h3 style={{ marginTop: 0 }}>Activity Trend (7 days)</h3>
          <p style={{ color: "#bdb4a8", marginBottom: 0 }}>{sessionsByDayText}</p>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: 12 }}>
          <div style={cardStyle}>
            <h3 style={{ marginTop: 0 }}>Create Event</h3>
            <form onSubmit={createEvent} style={{ display: "grid", gap: 10 }}>
              <input
                value={form.name}
                onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                placeholder="Event name"
                style={inputStyle}
                required
              />
              <textarea
                value={form.description}
                onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                placeholder="Description"
                style={{ ...inputStyle, minHeight: 90, resize: "vertical" }}
              />
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
                <input
                  type="datetime-local"
                  value={form.startAt}
                  onChange={(e) => setForm((f) => ({ ...f, startAt: e.target.value }))}
                  style={inputStyle}
                  required
                />
                <input
                  type="datetime-local"
                  value={form.endAt}
                  onChange={(e) => setForm((f) => ({ ...f, endAt: e.target.value }))}
                  style={inputStyle}
                  required
                />
              </div>
              <select value={form.status} onChange={(e) => setForm((f) => ({ ...f, status: e.target.value }))} style={inputStyle}>
                <option value="upcoming">upcoming</option>
                <option value="live">live</option>
                <option value="completed">completed</option>
                <option value="cancelled">cancelled</option>
              </select>
              <button type="submit" style={buttonStyle} disabled={isSavingEvent}>
                {isSavingEvent ? "Creating..." : "Create event"}
              </button>
            </form>
          </div>

          <div style={cardStyle}>
            <h3 style={{ marginTop: 0 }}>Recent Sessions</h3>
            <div style={{ display: "grid", gap: 8 }}>
              {metrics.recentSessions.length === 0 ? <div style={{ color: "#bdb4a8" }}>No sessions yet.</div> : null}
              {metrics.recentSessions.map((row) => (
                <div key={row.id} style={{ border: "1px solid rgba(155,140,118,0.2)", borderRadius: 8, padding: 10 }}>
                  <div style={{ fontWeight: 600 }}>{row.category} - {row.duration_minutes}m</div>
                  <div style={{ fontSize: 12, color: "#bdb4a8" }}>{row.clerk_user_id}</div>
                  <div style={{ fontSize: 12, color: "#8a8278" }}>{formatDateTime(row.created_at)}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div style={cardStyle}>
          <h3 style={{ marginTop: 0 }}>Events</h3>
          <div style={{ display: "grid", gap: 8 }}>
            {events.length === 0 ? <div style={{ color: "#bdb4a8" }}>No events created yet.</div> : null}
            {events.map((ev) => (
              <div key={ev.id} style={{ border: "1px solid rgba(155,140,118,0.2)", borderRadius: 8, padding: 10 }}>
                <div style={{ display: "flex", justifyContent: "space-between", gap: 8, flexWrap: "wrap" }}>
                  <div>
                    <div style={{ fontWeight: 700 }}>{ev.name}</div>
                    {ev.description ? <div style={{ color: "#bdb4a8", fontSize: 13 }}>{ev.description}</div> : null}
                    <div style={{ color: "#8a8278", fontSize: 12, marginTop: 4 }}>
                      {formatDateTime(ev.start_at)} {" -> "} {formatDateTime(ev.end_at)}
                    </div>
                  </div>
                  <div style={{ display: "flex", gap: 6, alignItems: "flex-start", flexWrap: "wrap" }}>
                    <span style={{ ...buttonStyle, cursor: "default", background: "#141210" }}>{ev.status}</span>
                    <button style={buttonStyle} onClick={() => setEventStatus(ev.id, "upcoming")}>Upcoming</button>
                    <button style={buttonStyle} onClick={() => setEventStatus(ev.id, "live")}>Live</button>
                    <button style={buttonStyle} onClick={() => setEventStatus(ev.id, "completed")}>Complete</button>
                    <button style={buttonStyle} onClick={() => setEventStatus(ev.id, "cancelled")}>Cancel</button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}