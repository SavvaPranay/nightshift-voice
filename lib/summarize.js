// Post-call triage. Transcript in, {summary, urgency} out.
//
// Provider order:
//   1. Mel relay   — set MEL_RELAY_URL + MEL_TOKEN (get the hosted base URL Friday)
//   2. Gemini      — set GEMINI_API_KEY
//   3. Extractive  — no network, always works, keeps the UI honest when both are absent

const PROMPT = `You triage after-hours calls for a small business. Read the transcript and reply with STRICT JSON only, no markdown:
{"summary":"<max 20 words, what the caller wants and any deadline>","urgency":"low"|"medium"|"high"}
high = pain, anger, money at risk, or a same-day deadline. low = routine.`;

function transcriptText(call) {
  return call.turns
    .map((t) => (t.role === "tool" ? `[tool: ${t.text}${t.detail ? ` ${t.detail}` : ""}]` : `${t.role}: ${t.text}`))
    .join("\n");
}

function parseJson(raw) {
  const m = raw && raw.match(/\{[\s\S]*\}/);
  if (!m) return null;
  try {
    const d = JSON.parse(m[0]);
    if (!d.summary) return null;
    return { summary: String(d.summary), urgency: ["low", "medium", "high"].includes(d.urgency) ? d.urgency : "medium" };
  } catch {
    return null;
  }
}

async function viaMel(text) {
  const base = process.env.MEL_RELAY_URL;
  const token = process.env.MEL_TOKEN;
  if (!base || !token) return null;

  const r = await fetch(`${base.replace(/\/$/, "")}/v1/agent/stream`, {
    method: "POST",
    headers: { "content-type": "application/json", authorization: `Bearer ${token}` },
    body: JSON.stringify({ prompt: `${PROMPT}\n\n${text}`, stream: false }),
  });
  if (!r.ok) return null;

  // Relay streams newline-delimited JSON. Collect any text fields and parse the JSON out.
  const body = await r.text();
  const chunks = body
    .split("\n")
    .filter(Boolean)
    .map((l) => { try { return JSON.parse(l); } catch { return null; } })
    .filter(Boolean)
    .map((d) => d.text || d.content || d.delta || "")
    .join("");

  const out = parseJson(chunks) || parseJson(body);
  return out ? { ...out, by: "mel" } : null;
}

async function viaGemini(text) {
  const key = process.env.GEMINI_API_KEY;
  if (!key) return null;

  const r = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${key}`,
    {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ contents: [{ parts: [{ text: `${PROMPT}\n\n${text}` }] }] }),
    }
  );
  if (!r.ok) return null;

  const d = await r.json();
  const raw = d?.candidates?.[0]?.content?.parts?.[0]?.text ?? "";
  const out = parseJson(raw);
  return out ? { ...out, by: "gemini" } : null;
}

function extractive(call) {
  const lastCaller = [...call.turns].reverse().find((t) => t.role === "caller");
  const text = (lastCaller?.text ?? "No caller speech recorded.").replace(/\s+/g, " ").trim();
  const words = text.split(" ");
  const summary = words.length > 20 ? words.slice(0, 20).join(" ") + "..." : text;

  const hot = /(pain|swollen|swelling|bleeding|emergency|urgent|today|asap|angry|refund|cancel)/i;
  return { summary, urgency: hot.test(text) ? "high" : "low", by: "extractive" };
}

export async function summarize(call) {
  const text = transcriptText(call);
  for (const fn of [viaMel, viaGemini]) {
    try {
      const out = await fn(text);
      if (out) return out;
    } catch {
      // fall through to the next provider
    }
  }
  return extractive(call);
}
