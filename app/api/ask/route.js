import { db } from "@/lib/store";
import { ask } from "@/lib/ask";

export async function POST(req) {
  const { call_id: callId, question, history } = await req.json().catch(() => ({}));
  const call = db.calls.find((c) => c.id === callId);
  if (!call) return Response.json({ error: "call not found" }, { status: 404 });
  if (!question?.trim()) return Response.json({ error: "no question" }, { status: 400 });

  const out = await ask(call, db.actions, question.trim(), history || []);
  return Response.json(out);
}
