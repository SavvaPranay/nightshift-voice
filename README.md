# Nightshift

**Voice agents can talk. They can't be trusted to act.**

An after-hours voice agent that finishes the call and then waits for a human before doing
anything that costs money or changes a commitment.

Built at the Miami AI Hackathon, September 2026, with ElevenLabs, Mel and SSOJet.

## The problem

Call a small business at 8pm and you get voicemail. Most people don't leave one, they call
the next business on the list. The obvious fix is an AI voice agent, and voice is good
enough now. But no owner will let an agent book appointments or quote prices unsupervised,
because one hallucinated price or double-booked slot is their reputation. So the agent gets
restricted to answering questions, and it becomes voicemail with a nicer voice.

ElevenLabs has a transfer-to-human tool, but transfer assumes someone is there to take the
call. After-hours is defined by nobody being there.

## The approach

The agent has two classes of tool.

**Commits immediately** (read-only or harmless):
`check_availability`, `capture_lead`, `take_message`

**Proposes only** (a human must approve before anything happens):
`propose_booking`, `propose_change`, `escalate`

For the second class the agent records a pending action and tells the caller the truth:
*"I have that written down and someone will confirm it shortly."* It never claims something
is booked when it isn't. The API returns the exact sentence the agent is allowed to say, so
the honesty rule is enforced server-side, not just requested in a prompt.

In the morning the owner opens the console, sees what's waiting, and approves or rejects.
Approving commits the action and calls the customer back to confirm.

```
call  ->  agent handles it  ->  proposes  ->  human approves  ->  commits  ->  caller notified
```

## Stack

| Layer | |
|---|---|
| Voice, knowledge base, tool calling | ElevenLabs Agents |
| Console + tool endpoints | Next.js 16, React 19, Tailwind v4 |
| Post-call triage | Mel relay, falling back to Gemini, then extractive |
| Auth | SSOJet |

## Run it

```bash
npm install
cp .env.example .env.local   # fill in your keys
npm run dev
```

The ElevenLabs agent needs a public URL for its webhook tools, so point them at your
deployment, not localhost.

## Notes

The knowledge base has deliberate gaps. Insurance and any unlisted price are missing, so
the agent has something real to refuse. An agent that can answer everything has nothing to
escalate.

One thing worth writing down: `rag.embedding_model` must match the model the index was
built with. If it doesn't, retrieval silently returns nothing and the model invents facts.
It sounds completely normal while doing it. Test against known values.
