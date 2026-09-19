# Architecture

```
Caller ──► ELEVENLABS AGENT ──webhook tools──► NEXT.JS APP ◄──SSOJet login── Owner
           voice, KB/RAG,                      tools + console
           policy prompt
```

## Two classes of tool

**Commits immediately** (agent acts alone):
| Tool | Does |
|---|---|
| `answer_from_kb` | Implicit, via knowledge base RAG |
| `check_availability` | Read-only lookup |
| `capture_lead` | Writes caller, need, callback number |
| `take_message` | Writes a message |

**Proposes only** (writes a pending action, does NOT commit):
| Tool | Does |
|---|---|
| `propose_booking` | Slot held as `pending`, not confirmed |
| `propose_change` | Change to an existing booking, pending |
| `escalate` | Anything out of policy. Pending, with reason |

The agent tells the caller plainly: *"I've got that ready, someone will confirm it shortly."*
It never claims something is done that isn't.

## Pending-action state machine

```
  proposed ──approve──► committed ──► caller notified
      │
      └────reject────► rejected ──► callback queued
```

Minimum row shape:
```
id, call_id, type, payload, status, reason, created_at, decided_at, decided_by
```
`status` in `proposed | committed | rejected`.

## Console (one page, two columns)

Left: call list, newest first, live ones flagged, pending actions badged.
Right: selected call's transcript timeline (agent turns, caller turns, tool calls,
the pending action) plus Approve / Reject buttons.

**Explicitly NOT building:** settings/policy UI (policy lives in the system prompt),
mobile layout, channels or tabs, user management, analytics, dark mode.

## Sponsor roles (each load-bearing, none bolted on)

- **ElevenLabs** — the agent itself. No voice, no product.
- **SSOJet** — login on the console. It shows customer call data, it cannot be open.
  Stretch: wrap the tool endpoints as an MCP server behind SSOJet MCP auth, which hits
  both halves the award names.
- **Mel** — how it's built. Stretch: post-call triage summary via the relay API
  (`POST /v1/agent/stream`, Bearer token). Build that with the Gemini key first so the
  feature ships regardless, then swap the call to Mel if time allows.

## Open questions for Friday onboarding

1. Does **Creator tier** support attaching a phone number? If not, the plan needs a new spine.
2. Is there a **hosted** Mel relay base URL, or is it local-only (`127.0.0.1:7711`)?
3. Does the submission need to be built in Mel to be eligible for the grand prize?
