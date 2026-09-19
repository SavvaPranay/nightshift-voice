// Free-form question answering about a single call, through the same provider
// chain as triage: Mel relay first, then Gemini, then a plain refusal.

function transcriptText(call) {
  return call.turns
    .map((t) => (t.role === "tool" ? `[tool: ${t.text}${t.detail ? ` ${t.detail}` : ""}]` : `${t.role}: ${t.text}`))
    .join("\n");
}

function context(call, actions) {
  const pending = actions.filter((a) => a.callId === call.id);
  const when = new Date(call.startedAt).toLocaleString("en-US");
  const dur = Math.round(((call.endedAt ?? Date.now()) - call.startedAt) / 1000);

  return [
    `CALLER: ${call.from}`,
    `WHEN: ${when}`,
    `DURATION: ${dur} seconds`,
    pending.length
      ? `ACTIONS: ${pending.map((a) => `${a.type} (${a.status}) ${a.summary}`).join("; ")}`
      : `ACTIONS: none`,
    "",
    "TRANSCRIPT:",
    transcriptText(call),
  ].join("\n");
}

const SYSTEM = `You help a business owner review a call their after-hours voice agent handled.
Answer only from the call record below. Be brief, two or three sentences at most.
If the record does not contain the answer, say so plainly. Never invent details about
the caller, the appointment, or what was said.`;

async function viaMel(prompt) {
  const base = process.env.MEL_RELAY_URL;
  const token = process.env.MEL_TOKEN;
  if (!base || !token) return null;

  const r = await fetch(`${base.replace(/\/$/, "")}/v1/agent/stream`, {
    method: "POST",
    headers: { "content-type": "application/json", authorization: `Bearer ${token}` },
    body: JSON.stringify({
      device_id: process.env.MEL_DEVICE_ID || "mel-triage",
      model: process.env.MEL_TRIAGE_MODEL || "gemini-2.5-flash",
      messages: [{ role: "user", content: prompt }],
      stream: true,
    }),
  });
  if (!r.ok) return null;

  const text = (await r.text())
    .split("\n")
    .filter(Boolean)
    .map((l) => { try { return JSON.parse(l); } catch { return null; } })
    .filter(Boolean)
    .map((d) => d.text || d.content || d.delta || "")
    .join("")
    .trim();

  return text ? { answer: text, by: "mel" } : null;
}

async function viaGemini(prompt) {
  const key = process.env.GEMINI_API_KEY;
  if (!key) return null;
  const r = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${key}`,
    { method: "POST", headers: { "content-type": "application/json" },
      body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] }) }
  );
  if (!r.ok) return null;
  const d = await r.json();
  const t = (d?.candidates?.[0]?.content?.parts?.[0]?.text ?? "").trim();
  return t ? { answer: t, by: "gemini" } : null;
}

export async function ask(call, actions, question) {
  const prompt = `${SYSTEM}\n\n${context(call, actions)}\n\nQUESTION: ${question}`;
  for (const fn of [viaMel, viaGemini]) {
    try {
      const out = await fn(prompt);
      if (out) return out;
    } catch {
      // try the next provider
    }
  }
  return { answer: "No model is reachable right now, so I can't answer that.", by: "none" };
}
