# Submission copy

## Track
**Agentic enterprise** (fits the approval-governance and SSO story better than commerce)

## Project description (300 char limit)

Call a business after hours and you get voicemail. Iris answers, handles the whole call, and
commits nothing on its own. Anything that costs money or changes a booking becomes a pending
action a human approves later. Then Iris calls the customer back to confirm.

## Demo video narration

For text-to-speech in Iris's own voice (Sarah, EXAVITQu4vr4xnSDxMaL). Roughly 2 minutes
read aloud, which is better than filling the full 5.

---

Call a small business at eight in the evening and you get voicemail. Most people do not
leave one. They call the next business on the list.

The obvious fix is an AI voice agent, and voice is good enough now. But no owner will let an
agent book appointments or quote prices while they are asleep. One wrong price, one double
booked slot, and it is their reputation. So the agent gets restricted to answering questions,
and it becomes voicemail with a nicer voice.

This is Iris.

Iris answers the phone when the office is closed. She knows the hours, the services, the
published prices. She can look up open slots and take a message.

What she cannot do is commit.

Watch what happens when a caller asks to book. Iris checks availability, writes the request
down, and says something specific: someone from the team will confirm it shortly. She does
not say it is booked. Because it is not.

That request appears here, in the console, as a pending action. Waiting for a person.

Now watch her refuse. The caller asks for a discount. That price is not in her knowledge
base, and she is not authorized to negotiate. So she does not guess. She escalates, and tells
the caller a human will call them back.

Nobody was awake for any of this.

In the morning, the owner opens the console. Everything that needed a decision is here, with
the transcript behind it. They approve the booking.

And Iris calls the customer back to confirm it, in the same voice that took the call.

That is the whole idea. Voice agents can talk. They cannot be trusted to act. This is the
layer in between.

Under the hood: ElevenLabs runs the conversation and the callback, the console is Next.js
with enterprise SSO through SSOJet, and the agent's tools are split in two. Read-only actions
commit immediately. Anything that costs money proposes and waits.

One last thing. During testing, a tool call failed and Iris still told the caller their
request was written down. It was not. That is exactly the failure this product exists to
prevent, so it is now impossible: a failed tool means nothing was recorded, and she has to
say so.

An agent that admits what it could not do is worth more than one that sounds confident.

---

## The one line to open the live demo with

"Voice agents can talk. They cannot be trusted to act. That is why businesses still pay
people to answer phones at night."

## Mel rating notes (answer honestly)

Real observations worth giving them:
- It sandboxes file writes to the project root, so absolute paths get rewritten inside the
  project. Once you use relative paths it behaves.
- Free tier ships zero hosted credits and the failure is silent: turns return empty with no
  loud error. That cost time to diagnose.
- Built-in code review and the chord that attaches a failed command's output as agent
  context are genuinely good ergonomics.
