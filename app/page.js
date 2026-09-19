"use client";

import { useEffect, useState, useCallback } from "react";

const fmtTime = (ts) =>
  new Date(ts).toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" });

const fmtDur = (a, b) => {
  const s = Math.max(0, Math.round(((b ?? Date.now()) - a) / 1000));
  return `${Math.floor(s / 60)}m ${String(s % 60).padStart(2, "0")}s`;
};

const URGENCY_STYLES = {
  high:   "bg-accent-100 text-accent-dark border-accent-200",
  medium: "bg-ink-100 text-ink-600 border-ink-200",
  low:    "bg-ink-50 text-ink-400 border-ink-200",
};

export default function Console() {
  const [calls, setCalls] = useState([]);
  const [actions, setActions] = useState([]);
  const [selected, setSelected] = useState(null);
  const [busy, setBusy] = useState(null);
  const [q, setQ] = useState("");
  const [thread, setThread] = useState([]);
  const [asking, setAsking] = useState(false);
  const [me, setMe] = useState(null);
  const [summing, setSumming] = useState(null);

  const load = useCallback(async () => {
    const r = await fetch("/api/calls", { cache: "no-store" });
    const d = await r.json();
    setCalls(d.calls);
    setActions(d.actions);
    setSelected((s) => s ?? d.calls[0]?.id ?? null);
  }, []);

  useEffect(() => {
    fetch("/api/auth/session")
      .then((r) => r.json())
      .then((d) => setMe(d?.user?.email ?? null))
      .catch(() => {});
  }, []);

  useEffect(() => {
    load();
    const t = setInterval(load, 3000);
    return () => clearInterval(t);
  }, [load]);

  const decide = async (id, decision) => {
    setBusy(id);
    await fetch(`/api/actions/${id}`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ decision }),
    });
    await load();
    setBusy(null);
  };

  useEffect(() => { setThread([]); setQ(""); }, [selected]);

  const call = calls.find((c) => c.id === selected);

  useEffect(() => {
    if (!call || call.triage || call.turns.length < 2 || call.live) return;
    fetch("/api/summarize", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ call_id: call.id }),
    }).then(load);
  }, [call?.id, call?.triage, call?.turns.length, call?.live, load]);
  const signOut = async () => {
    const { csrfToken } = await fetch("/api/auth/csrf").then((r) => r.json());
    const body = new URLSearchParams({ csrfToken, callbackUrl: "/signin" });
    await fetch("/api/auth/signout", {
      method: "POST",
      headers: { "content-type": "application/x-www-form-urlencoded" },
      body,
    });
    window.location.href = "/signin";
  };

  const askMel = async (e) => {
    e.preventDefault();
    const question = q.trim();
    if (!question || asking) return;
    setQ("");
    setThread((t) => [...t, { role: "you", text: question }]);
    setAsking(true);
    try {
      const r = await fetch("/api/ask", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ call_id: selected, question, history: thread }),
      });
      const d = await r.json();
      setThread((t) => [...t, { role: "mel", text: d.answer, by: d.by }]);
    } catch {
      setThread((t) => [...t, { role: "mel", text: "Could not reach Mel.", by: "none" }]);
    }
    setAsking(false);
  };

  const callActions = actions.filter((a) => a.callId === selected);
  const pendingCount = actions.filter((a) => a.status === "proposed").length;
  const actionsFor = (id) => actions.filter((a) => a.callId === id);

  return (
    <div className="min-h-screen flex flex-col">
      <header className="border-b border-ink-200 bg-white/70 backdrop-blur px-6 py-4 flex items-baseline gap-4 flex-wrap">
        <h1 className="font-display text-2xl tracking-tight">Iris</h1>
        <p className="text-ink-500 text-sm">Northside Dental &middot; after hours</p>
        <div className="ml-auto flex items-center gap-3">
          {pendingCount > 0 && (
            <span className="text-xs font-mono px-2.5 py-1 rounded-full bg-accent-100 text-accent-dark border border-accent-200">
              {pendingCount} awaiting you
            </span>
          )}
          <span className="text-xs text-ink-400 font-mono">{me ?? "signed in"}</span>
          <button
            onClick={signOut}
            className="text-xs font-mono px-2.5 py-1 rounded-full border border-ink-300 text-ink-600 hover:bg-ink-200 transition-colors"
          >
            sign out
          </button>
        </div>
      </header>

      <main className="flex-1 grid grid-cols-1 md:grid-cols-[320px_1fr]">
        {/* Call list */}
        <aside className="border-r border-ink-200 bg-ink-100/50">
          <div className="px-5 py-3 text-[11px] uppercase tracking-widest text-ink-400 font-mono">
            Calls
          </div>
          {calls.length === 0 && (
            <p className="px-5 py-4 text-sm text-ink-400 leading-relaxed">
              No calls yet. Iris is on the line and waiting.
            </p>
          )}
          <ul>
            {calls.map((c) => {
              const pend = actionsFor(c.id).filter((a) => a.status === "proposed").length;
              const active = c.id === selected;
              return (
                <li key={c.id}>
                  <button
                    onClick={() => setSelected(c.id)}
                    className={`w-full text-left px-5 py-3.5 border-l-2 transition-colors animate-arrive ${
                      active
                        ? "border-l-accent bg-white"
                        : "border-l-transparent hover:bg-white/60"
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      {c.live && (
                        <span className="w-1.5 h-1.5 rounded-full bg-accent animate-livepulse" />
                      )}
                      <span className="font-mono text-sm text-ink-900">{c.from}</span>
                    </div>
                    <div className="mt-1 flex items-center gap-2 text-xs text-ink-500">
                      <span className="font-mono">{fmtTime(c.startedAt)}</span>
                      <span className="text-ink-300">&middot;</span>
                      <span className="font-mono">{fmtDur(c.startedAt, c.endedAt)}</span>
                      {pend > 0 && (
                        <span className="ml-auto text-accent-dark font-medium">
                          {pend} pending
                        </span>
                      )}
                    </div>
                  </button>
                </li>
              );
            })}
          </ul>
        </aside>

        {/* Transcript + actions */}
        <section className="p-6 md:p-8 max-w-3xl">
          {!call ? (
            <div className="max-w-md">
              <h2 className="font-display text-3xl">Waiting for calls</h2>
              <p className="mt-3 text-ink-500 leading-relaxed">
                Everything here is real. Calls appear as they come in, and anything the
                agent could not do on its own shows up as a pending action for you to
                approve.
              </p>
            </div>
          ) : (
            <>
              <div className="flex items-baseline gap-3 flex-wrap">
                <h2 className="font-display text-3xl">{call.from}</h2>
                {call.live && (
                  <span className="text-xs font-mono text-accent-dark bg-accent-100 border border-accent-200 px-2 py-0.5 rounded-full">
                    live
                  </span>
                )}
                <span className="text-ink-500 text-sm font-mono">
                  {fmtTime(call.startedAt)} &middot; {fmtDur(call.startedAt, call.endedAt)}
                </span>
              </div>

              {callActions.length > 0 && (
                <div className="mt-6 space-y-3">
                  {callActions.map((a) => {
                    const pending = a.status === "proposed";
                    const committed = a.status === "committed";
                    return (
                      <div
                        key={a.id}
                        className={`rounded-lg border p-4 animate-arrive ${
                          pending
                            ? "border-accent-200 bg-accent-50"
                            : committed
                            ? "border-sage-200 bg-sage-50"
                            : "border-ink-200 bg-ink-100"
                        }`}
                      >
                        <div className="flex items-start gap-3 flex-wrap">
                          <div className="flex-1 min-w-[12rem]">
                            <div className="font-mono text-[11px] uppercase tracking-widest text-ink-500">
                              {a.type.replace(/_/g, " ")}
                            </div>
                            <div className="mt-1 text-ink-900">{a.summary}</div>
                            {a.reason && (
                              <div className="mt-1 text-sm text-ink-500">{a.reason}</div>
                            )}
                          </div>

                          {pending ? (
                            <div className="flex gap-2">
                              <button
                                disabled={busy === a.id}
                                onClick={() => decide(a.id, "approve")}
                                className="px-3.5 py-1.5 rounded-md bg-sage text-white text-sm hover:bg-sage-light disabled:opacity-50 transition-colors"
                              >
                                Approve
                              </button>
                              <button
                                disabled={busy === a.id}
                                onClick={() => decide(a.id, "reject")}
                                className="px-3.5 py-1.5 rounded-md border border-ink-300 text-ink-700 text-sm hover:bg-ink-200 disabled:opacity-50 transition-colors"
                              >
                                Reject
                              </button>
                            </div>
                          ) : (
                            <span
                              className={`font-mono text-xs px-2 py-1 rounded-full ${
                                committed
                                  ? "bg-sage-100 text-sage border border-sage-200"
                                  : "bg-ink-200 text-ink-600"
                              }`}
                            >
                              {committed ? "committed" : "rejected"}
                            </span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              <ol className="mt-8 space-y-4 border-l border-ink-200 pl-5">
                {call.turns.map((t, i) => (
                  <li key={i} className="relative animate-arrive">
                    <span
                      className={`absolute -left-[1.55rem] top-2 w-2 h-2 rounded-full ${
                        t.role === "tool"
                          ? "bg-accent"
                          : t.role === "agent"
                          ? "bg-ink-400"
                          : "bg-ink-900"
                      }`}
                    />
                    <div className="font-mono text-[11px] uppercase tracking-widest text-ink-400">
                      {t.role === "tool" ? "tool" : t.role}
                      <span className="ml-2 normal-case tracking-normal">{fmtTime(t.at)}</span>
                    </div>
                    {t.role === "tool" ? (
                      <div className="mt-0.5 font-mono text-sm text-accent-dark">
                        {t.text}
                        {t.detail ? (
                          <span className="text-ink-500">: {t.detail}</span>
                        ) : null}
                      </div>
                    ) : (
                      <p className="mt-0.5 text-ink-800 leading-relaxed">{t.text}</p>
                    )}
                  </li>
                ))}
              </ol>

              <div className="mt-10 border-t border-ink-200 pt-6">
                <div className="flex items-baseline gap-2 flex-wrap">
                  <h3 className="font-display text-xl">After the call</h3>
                  <span className="font-mono text-[11px] text-ink-400">powered by Mel</span>
                </div>

                {call.triage ? (
                  <div className="mt-3 rounded-lg border border-ink-200 bg-white p-4">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-mono text-[11px] uppercase tracking-widest text-ink-400">
                        triage
                      </span>
                      <span
                        className={`font-mono text-[11px] px-2 py-0.5 rounded-full border ${
                          call.triage.urgency === "high"
                            ? "bg-accent-100 text-accent-dark border-accent-200"
                            : "bg-ink-100 text-ink-600 border-ink-200"
                        }`}
                      >
                        {call.triage.urgency}
                      </span>
                      <span className="ml-auto font-mono text-[11px] text-ink-400">
                        via {call.triage.by}
                      </span>
                    </div>
                    <p className="mt-2 text-ink-900 leading-relaxed">{call.triage.summary}</p>
                  </div>
                ) : (
                  <p className="mt-3 text-sm text-ink-400">
                    Not enough was said on this call to summarize.
                  </p>
                )}

                {thread.length > 0 && (
                  <div className="mt-4 space-y-3">
                    {thread.map((t, i) => (
                      <div key={i} className="animate-arrive">
                        <div className="font-mono text-[11px] uppercase tracking-widest text-ink-400">
                          {t.role === "you" ? "you" : `mel${t.by && t.by !== "mel" ? ` (${t.by})` : ""}`}
                        </div>
                        <p
                          className={`mt-0.5 leading-relaxed ${
                            t.role === "you" ? "text-ink-600" : "text-ink-900"
                          }`}
                        >
                          {t.text}
                        </p>
                      </div>
                    ))}
                  </div>
                )}

                <form onSubmit={askMel} className="mt-4 flex gap-2">
                  <input
                    value={q}
                    onChange={(e) => setQ(e.target.value)}
                    placeholder="Ask about this call or the caller"
                    className="flex-1 min-w-0 px-3 py-2 rounded-md border border-ink-300 bg-white text-ink-900 placeholder:text-ink-400 focus:outline-none focus:border-ink-500"
                  />
                  <button
                    disabled={asking || !q.trim()}
                    className="px-4 py-2 rounded-md bg-ink-900 text-ink-50 text-sm hover:bg-ink-800 disabled:opacity-40 transition-colors"
                  >
                    {asking ? "Asking" : "Ask Mel"}
                  </button>
                </form>
              </div>
            </>
          )}
        </section>
      </main>
    </div>
  );
}
