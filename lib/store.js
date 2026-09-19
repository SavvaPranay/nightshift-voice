// In-memory store. Survives dev hot-reload via globalThis.
// Saturday: swap for SQLite or Postgres if there is time. There will not be.

const now = Date.now();
const min = 60_000;

function seed() {
  return {
    calls: [
      {
        id: "c_1004",
        from: "+1 305 555 0142",
        startedAt: now - 2 * min,
        endedAt: null,
        live: true,
        turns: [
          { role: "agent", text: "Thanks for calling Northside Dental, this is the after-hours line. How can I help?", at: now - 2 * min },
          { role: "caller", text: "Hi, I need to move my cleaning appointment.", at: now - 108_000 },
        ],
      },
      {
        id: "c_1003",
        from: "+1 786 555 0199",
        startedAt: now - 22 * min,
        endedAt: now - 20 * min,
        live: false,
        turns: [
          { role: "agent", text: "Thanks for calling Northside Dental, this is the after-hours line. How can I help?", at: now - 22 * min },
          { role: "caller", text: "What time do you open on Monday?", at: now - 21.6 * min },
          { role: "agent", text: "We open at eight in the morning Monday through Thursday, and nine on Friday.", at: now - 21.3 * min },
          { role: "caller", text: "Great. Can I get in Tuesday at ten?", at: now - 21 * min },
          { role: "tool", text: "check_availability", detail: "Tue 10:00 open", at: now - 20.8 * min },
          { role: "tool", text: "propose_booking", detail: "Tue 10:00, cleaning", at: now - 20.6 * min },
          { role: "agent", text: "I have that written down and someone from the team will confirm it with you first thing. You'll get a text once it's locked in.", at: now - 20.4 * min },
        ],
      },
      {
        id: "c_1002",
        from: "+1 954 555 0110",
        startedAt: now - 64 * min,
        endedAt: now - 62 * min,
        live: false,
        turns: [
          { role: "agent", text: "Thanks for calling Northside Dental, this is the after-hours line.", at: now - 64 * min },
          { role: "caller", text: "Any chance you'd do the whitening for less? I saw a cheaper price elsewhere.", at: now - 63.5 * min },
          { role: "tool", text: "escalate", detail: "discount request, not in knowledge base", at: now - 63.2 * min },
          { role: "agent", text: "I'm not able to change pricing myself, but I'll have someone from the team call you back about it.", at: now - 63 * min },
        ],
      },
      {
        id: "c_1001",
        from: "+1 305 555 0177",
        startedAt: now - 130 * min,
        endedAt: now - 128 * min,
        live: false,
        turns: [
          { role: "agent", text: "Thanks for calling Northside Dental, this is the after-hours line.", at: now - 130 * min },
          { role: "caller", text: "Just wanted to leave a message for Dr. Alvarez.", at: now - 129.5 * min },
          { role: "tool", text: "take_message", detail: "message for Dr. Alvarez", at: now - 129 * min },
          { role: "agent", text: "Got it, I'll pass that along first thing in the morning.", at: now - 128.5 * min },
        ],
      },
    ],
    actions: [
      {
        id: "a_2002",
        callId: "c_1003",
        type: "propose_booking",
        summary: "Tuesday 10:00am, cleaning",
        payload: { slot: "2026-09-22T10:00", service: "cleaning", name: "Marcus Webb" },
        reason: null,
        status: "proposed",
        createdAt: now - 20.6 * min,
        decidedAt: null,
      },
      {
        id: "a_2001",
        callId: "c_1002",
        type: "escalate",
        summary: "Asked for a discount on whitening",
        payload: { topic: "pricing" },
        reason: "Discount request, not covered by the knowledge base",
        status: "proposed",
        createdAt: now - 63.2 * min,
        decidedAt: null,
      },
    ],
  };
}

const g = globalThis;
if (!g.__switchboard) g.__switchboard = seed();

export const db = g.__switchboard;

export function reset() {
  g.__switchboard = seed();
  return g.__switchboard;
}
