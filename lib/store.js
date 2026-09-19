// In-memory store. Survives dev hot-reload via globalThis.
//
// Starts EMPTY. Everything in here is real: calls arrive from the ElevenLabs
// conversation sync, pending actions are written by the agent's webhook tools.
// No seed data, so nothing on screen was invented.

function empty() {
  return { calls: [], actions: [] };
}

const g = globalThis;
if (!g.__iris) g.__iris = empty();

export const db = g.__iris;

export function reset() {
  g.__iris.calls.length = 0;
  g.__iris.actions.length = 0;
  return g.__iris;
}
