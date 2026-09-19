"use client";

import { useEffect, useState, useCallback } from "react";

const fmtTime = (ts) =>
  new Date(ts).toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" });

const fmtDur = (a, b) => {
  const s = Math.max(0, Math.round(((b ?? Date.now()) - a) / 1000));
  return `${Math.floor(s / 60)}m ${String(s % 60).padStart(2, "0")}s`;
};

export default function Console() {
  const [calls, setCalls] = useState([]);
  const [actions, setActions] = useState([]);
  const [selected, setSelected] = useState(null);
  const [busy, setBusy] = useState(null);

  const load = useCallback(async () => {
    const r = await fetch("/api/calls", { cache: "no-store" });
    const d = await r.json();
    setCalls(d.calls);
    setActions(d.actions);
    setSelected((s) => s ?? d.calls[0]?.id ?? null);
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

  const call = calls.find((c) => c.id === selected);
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
          <span className="text-xs text-ink-400 font-mono">pranay@iris</span>
        </div>
      </header>

      <main className="flex-1 grid grid-cols-1 md:grid-cols-[320px_1fr]">
        {/* Call list */}
        <aside className="border-r border-ink-200 bg-ink-100/50">
          <div className="px-5 py-3 text-[11px] uppercase tracking-widest text-ink-400 font-mono">
            Calls
          </div>
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
            <p className="text-ink-400">No calls yet.</p>
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
            </>
          )}
        </section>
      </main>
    </div>
  );
}
