import { db } from "@/lib/store";
import { syncFromElevenLabs } from "@/lib/sync";

export const dynamic = "force-dynamic";

export async function GET() {
  let sync = { synced: 0 };
  try {
    sync = await syncFromElevenLabs();
  } catch (e) {
    sync = { synced: 0, error: String(e.message || e).slice(0, 160) };
  }
  const calls = [...db.calls].sort((a, b) => b.startedAt - a.startedAt);
  return Response.json({ calls, actions: db.actions, sync });
}
