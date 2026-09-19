import { reset } from "@/lib/store";

export async function POST() {
  reset();
  return Response.json({ ok: true });
}
