import { db } from "@/lib/store";
import { outboundCall } from "@/lib/elevenlabs";

// A human decides. This is the whole product.
//
// Approving does not just flip a flag: it commits the action and calls the
// customer back so they hear the confirmation. That callback is the point.

function digits(s) {
  const d = String(s || "").replace(/[^\d+]/g, "");
  if (!d) return null;
  if (d.startsWith("+")) return d;
  if (d.length === 10) return `+1${d}`;
  if (d.length === 11 && d.startsWith("1")) return `+${d}`;
  return null;
}

function confirmLine(action) {
  if (action.type === "propose_booking")
    return `Hi, this is Iris calling from Northside Dental. Good news, your request for ${action.summary} is confirmed. We'll see you then. Nothing else is needed from you.`;
  if (action.type === "propose_change")
    return `Hi, this is Iris from Northside Dental. Your appointment change is confirmed: ${action.summary}.`;
  return `Hi, this is Iris from Northside Dental, following up on your call about ${action.summary}. Someone from our team will be with you shortly.`;
}

export async function POST(req, { params }) {
  const { id } = await params;
  const { decision } = await req.json();

  const action = db.actions.find((a) => a.id === id);
  if (!action) return Response.json({ error: "not found" }, { status: 404 });
  if (action.status !== "proposed")
    return Response.json({ error: "already decided" }, { status: 409 });

  action.status = decision === "approve" ? "committed" : "rejected";
  action.decidedAt = Date.now();

  let callback = { attempted: false };
  if (action.status === "committed") {
    const call = db.calls.find((c) => c.id === action.callId);
    const to = digits(action.payload?.from || call?.from);
    const phoneNumberId = process.env.ELEVENLABS_PHONE_NUMBER_ID;
    const agentId = process.env.ELEVENLABS_AGENT_ID;

    if (to && phoneNumberId && agentId) {
      callback.attempted = true;
      try {
        const r = await outboundCall({
          agentId,
          phoneNumberId,
          toNumber: to,
          firstMessage: confirmLine(action),
        });
        callback.ok = true;
        callback.conversationId = r?.conversation_id ?? null;
        action.callbackAt = Date.now();
      } catch (e) {
        callback.ok = false;
        callback.error = String(e.message || e).slice(0, 180);
      }
    } else {
      callback.skipped = !to ? "no caller number" : "phone number or agent not configured";
    }
  }

  return Response.json({ ok: true, action, callback });
}
