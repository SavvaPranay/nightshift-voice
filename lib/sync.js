import { db } from "./store";
import { listConversations, getConversation } from "./elevenlabs";

// Pull real conversations from ElevenLabs and merge them into the local store,
// so the console shows what was actually said, not just the tool calls.

function mapTurns(convo) {
  const src = convo?.transcript || [];
  return src
    .filter((t) => (t.message || "").trim() || (t.tool_calls || []).length)
    .flatMap((t) => {
      const at = (convo.metadata?.start_time_unix_secs ?? 0) * 1000 + (t.time_in_call_secs ?? 0) * 1000;
      const out = [];
      for (const c of t.tool_calls || []) {
        out.push({ role: "tool", text: c.tool_name || c.name || "tool", detail: "", at });
      }
      if ((t.message || "").trim()) {
        out.push({ role: t.role === "user" ? "caller" : "agent", text: t.message.trim(), at });
      }
      return out;
    });
}

export async function syncFromElevenLabs() {
  const agentId = process.env.ELEVENLABS_AGENT_ID;
  if (!agentId || !process.env.ELEVENLABS_API_KEY) return { synced: 0, skipped: "not configured" };

  const { conversations = [] } = await listConversations(agentId, 15);
  let synced = 0;

  for (const c of conversations) {
    const id = c.conversation_id;
    let detail;
    try {
      detail = await getConversation(id);
    } catch {
      continue;
    }

    const startedAt = (detail.metadata?.start_time_unix_secs ?? Math.floor(Date.now() / 1000)) * 1000;
    const durSecs = detail.metadata?.call_duration_secs ?? 0;
    // Anything that has not finished is live. ElevenLabs reports a call that has just
    // started as "initiated", which the old check missed, so ringing calls looked done.
    const DONE = new Set(["done", "failed", "error", "cancelled", "canceled"]);
    const live = !DONE.has(String(detail.status || "").toLowerCase());

    let call = db.calls.find((x) => x.id === id);
    if (!call) {
      call = { id, from: detail.metadata?.phone_call?.external_number || "web test", startedAt, endedAt: null, live, turns: [] };
      db.calls.unshift(call);
    }
    call.live = live;
    call.endedAt = live ? null : startedAt + durSecs * 1000;
    call.turns = mapTurns(detail);
    synced++;
  }
  return { synced };
}
