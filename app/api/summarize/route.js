import { db } from "@/lib/store";
import { summarize } from "@/lib/summarize";

export async function POST(req) {
  const { call_id: callId } = await req.json().catch(() => ({}));
  const call = db.calls.find((c) => c.id === callId);
  if (!call) return Response.json({ error: "not found" }, { status: 404 });

  const result = await summarize(call);
  call.triage = result;
  return Response.json(result);
}
