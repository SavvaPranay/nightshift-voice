import { db } from "@/lib/store";

// Webhook tools the ElevenLabs agent calls mid-call.
// COMMIT NOW: check_availability, capture_lead, take_message
// PROPOSE ONLY: propose_booking, propose_change, escalate

const PROPOSE_ONLY = new Set(["propose_booking", "propose_change", "escalate"]);

function findOrCreateCall(callId, from) {
  let call = db.calls.find((c) => c.id === callId);
  if (!call) {
    call = { id: callId, from: from || "unknown", startedAt: Date.now(), endedAt: null, live: true, turns: [] };
    db.calls.unshift(call);
  }
  return call;
}

export async function POST(req, { params }) {
  const { tool } = await params;
  const body = await req.json().catch(() => ({}));
  const { call_id: callId = `c_${Date.now()}`, from, ...payload } = body;

  const call = findOrCreateCall(callId, from);
  call.turns.push({ role: "tool", text: tool, detail: payload.summary || "", at: Date.now() });

  if (tool === "check_availability") {
    return Response.json({ available: ["Tue 10:00", "Tue 14:30", "Wed 09:00"] });
  }

  if (tool === "capture_lead" || tool === "take_message") {
    return Response.json({ ok: true, recorded: true });
  }

  if (PROPOSE_ONLY.has(tool)) {
    const action = {
      id: `a_${Date.now()}`,
      callId: call.id,
      type: tool,
      summary: payload.summary || tool,
      payload,
      reason: payload.reason || null,
      status: "proposed",
      createdAt: Date.now(),
      decidedAt: null,
    };
    db.actions.unshift(action);

    // What the agent is told to say back to the caller. It must not claim this is done.
    return Response.json({
      ok: true,
      committed: false,
      say: "I have that written down and someone from the team will confirm it shortly. You'll get a text once it's locked in.",
    });
  }

  return Response.json({ error: `unknown tool: ${tool}` }, { status: 400 });
}
