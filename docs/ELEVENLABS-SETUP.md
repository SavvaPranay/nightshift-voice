# ElevenLabs agent setup

Dashboard work. Cannot be scripted, you click through it.

## 1. API key

https://elevenlabs.io/app/settings/api-keys

Create a dedicated key for this project rather than reusing one. One key per project keeps
rotation simple.

Store in `app/.env.local` (gitignored, never committed):
```
ELEVENLABS_API_KEY=sk_...
ELEVENLABS_AGENT_ID=
```
Record it in your password manager.

## 2. Create the agent

Agents -> Create agent. Blank, not a template.

| Setting | Value | Why |
|---|---|---|
| Name | Iris (Northside Dental) | |
| LLM | Claude Sonnet or GPT-4o class | Needs to follow policy reliably |
| TTS model | **`eleven_flash_v2`** | English agents CANNOT use v2_5. API rejects it: "English Agents must use turbo or flash v2." Flash v2 is lowest latency |
| Streaming | On | |
| Voice | One warm, neutral US voice | Pick once and keep it. Avoid anything theatrical |
| First message | "Thanks for calling Northside Dental, this is the after-hours line. How can I help?" | |
| Max duration | 5 min | Stops a runaway call eating credits |

## 3. System prompt

Paste `POLICY-PROMPT.md` verbatim. Replace `{{BUSINESS}}` with `Northside Dental`.

## 4. Knowledge base

Paste `KNOWLEDGE-BASE.md`. Turn **RAG on**. Leave documents in "Auto" mode so they are
retrieved only when relevant.

Note the deliberate gaps: insurance and unlisted prices are missing so the agent has
something real to refuse. That refusal is the demo.

## 5. Webhook tools

Base URL is your public URL. Localhost will not work, ElevenLabs calls you from the
internet. Sort that out Saturday morning before wiring tools.

All are `POST`, content-type `application/json`.

| Tool | URL | Sends |
|---|---|---|
| `check_availability` | `{BASE}/api/tools/check_availability` | `call_id` |
| `capture_lead` | `{BASE}/api/tools/capture_lead` | `call_id`, `from`, `summary` |
| `take_message` | `{BASE}/api/tools/take_message` | `call_id`, `summary` |
| `propose_booking` | `{BASE}/api/tools/propose_booking` | `call_id`, `from`, `summary` |
| `propose_change` | `{BASE}/api/tools/propose_change` | `call_id`, `summary` |
| `escalate` | `{BASE}/api/tools/escalate` | `call_id`, `summary`, `reason` |

Shared parameter schema (adjust per tool):
```json
{
  "call_id": { "type": "string", "description": "The conversation id for this call" },
  "from":    { "type": "string", "description": "Caller's phone number" },
  "summary": { "type": "string", "description": "One short sentence describing the request" },
  "reason":  { "type": "string", "description": "Why this needs a human. Escalate only." }
}
```

**Tool descriptions matter more than the schema.** The description is what the model reads
when deciding whether to call it. Write them as instructions:

- `propose_booking` — "Use when the caller wants to book an appointment. This does NOT book
  it. It records a request for a human to confirm. Never tell the caller they are booked."
- `escalate` — "Use when the request is outside your policy, not in the knowledge base, or
  you are unsure. Prefer this over guessing."

## 6. Phone number

Two paths. Buy one in ElevenLabs directly, or buy in Twilio and import with Account SID +
Auth Token (they auto-configure the webhook, no TwiML).

**Confirm at Friday onboarding whether Creator tier can attach a number.** If it cannot,
this plan needs a different spine and you want to know at noon, not at 1pm Saturday.

## 7. Test before trusting it

Call it and try all four beats from DEMO-SCRIPT.md:
1. A question it knows (Monday hours) -> answers
2. A booking (Tuesday 10am) -> proposes, does NOT claim it is booked
3. A discount request -> refuses and escalates
4. An insurance question -> escalates, because the KB has no answer

If it invents an insurance answer, the system prompt lost to the model. Tighten the
"escalate when unsure" language and retest.


## BUILT (Sep 18, 2026) — actual working config

Created via API, not the dashboard. Verified by simulation.

```
agent_id  agent_3101m2vq8z5xe4vbf2es61062zsf
name      Iris - Northside Dental (after-hours)
voice     Sarah  EXAVITQu4vr4xnSDxMaL
tts       eleven_flash_v2
llm       gemini-2.0-flash, temperature 0.3
kb doc    Dy9jVqb8AO1TkhA4TNyG  "Northside Dental facts"
max call  300s
```

### The RAG trap that cost a hallucination

`rag.embedding_model` defaults to **`e5_mistral_7b_instruct`**. If you build the index with
a different model (e.g. `multilingual_e5_large_instruct`), the agent looks for an index that
does not exist, **retrieval silently returns nothing, and the LLM invents facts.**

First test run it invented a $150 cleaning (real: $110), a fake address, and said yes to
implants (the practice refers those out).

**Fixes applied:**
1. Aligned `rag.embedding_model` to `multilingual_e5_large_instruct` (also better for Spanish)
2. Set `knowledge_base[].usage_mode` to **`prompt`** so the 1.2KB KB is always injected.
   Retrieval is not worth the risk on a corpus this small
3. Added a "Grounding (absolute)" section to the system prompt forbidding any unsourced
   fact and naming the implants/orthodontics exclusion explicitly

**Lesson for Saturday: silent retrieval failure looks identical to a working agent.**
Always test against known values, never against vibes.

