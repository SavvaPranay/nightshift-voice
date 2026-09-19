# Miami AI Hackathon — Sep 18-19, 2026

Workspace for the Mel + ElevenLabs hackathon. **Planning only until Sat Sep 19, 12:30pm ET.**
The event rule is explicit: *"No building before the clock starts. The work happens inside the
build window."* Nothing in `app/` exists until then.

## The event

| | |
|---|---|
| Online kickoff | Fri Sep 18, 12:00pm ET (invite code, starter kit, credits) |
| In person | Sat Sep 19, 12:30-8:30pm ET, Miami Dade College, 300 NE 2nd Ave |
| Submissions close | Sat 6:00pm ET |
| Awards | 6:00-8:30pm |
| Team | Solo |

Hard requirement: check in 12:30, stay to the end, complete the final build session on-site,
or the project is not accepted.

## The product

**Not** an AI receptionist. ElevenLabs already gives you voice, knowledge base, RAG, tool
calling and phone numbers, and half the room will demo that.

**The pitch:** voice agents can talk, they can't be trusted to act. This is the approval
layer that makes them deployable after hours.

ElevenLabs has `transfer_to_number`, but transfer assumes a human is available *right now*.
After-hours is defined by nobody being there. So the agent finishes the call, and a human
approves in the morning.

## Docs

| File | What |
|---|---|
| `docs/PLAN.md` | Architecture, tools, the pending-action state machine |
| `docs/POLICY-PROMPT.md` | The agent's system prompt. Highest-value artifact. Copy-paste Saturday |
| `docs/RUNBOOK.md` | Hour by hour, with the drop order decided in advance |
| `docs/DEMO-SCRIPT.md` | The exact call to perform and what's on screen at each beat |
| `docs/SETUP.md` | Pre-event checklist and account state |

## Rules of engagement

- Mel is the build tool, Claude Code is the fallback. A finished demo beats a pure-Mel one
  that missed 6pm. No tool is mandatory; only attendance is.
- Scope Mel's folder chip to this project directory only, never a parent that holds
  credentials for other work.
