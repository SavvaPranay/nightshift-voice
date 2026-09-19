import { db } from "@/lib/store";

// A human decides. This is the whole product.
export async function POST(req, { params }) {
  const { id } = await params;
  const { decision } = await req.json();

  const action = db.actions.find((a) => a.id === id);
  if (!action) return Response.json({ error: "not found" }, { status: 404 });
  if (action.status !== "proposed")
    return Response.json({ error: "already decided" }, { status: 409 });

  action.status = decision === "approve" ? "committed" : "rejected";
  action.decidedAt = Date.now();

  // Saturday: on commit, actually write the booking and text the caller.
  return Response.json({ ok: true, action });
}
