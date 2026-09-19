# Pre-event setup

Account setup and installs are allowed before the clock (the organizers told everyone to
install Mel beforehand). Application code is not.

## Status

| Item | State |
|---|---|
| Luma registration | DONE (2 Builder tickets, the registered account) |
| Mel installed | DONE, v0.1.41 at `/Applications/Mel.app`, signed + notarized, verified |
| Mel signed in | DONE, the registered account (matches Luma + credits) |
| Mel credits | **ZERO.** Free tier grants none. Fails silently with empty turns |
| Mel provider key | TODO: new Gemini key -> Settings -> AI (no OpenRouter support) |
| Twilio number + card | TODO tonight. ~$1/mo. Card lifts all trial limits instantly |
| SSOJet project | TODO: account, issuer URL, client ID, secret |
| ElevenLabs | API key stored in .env.local, never committed |

## Friday 12:00pm ET onboarding — be there

This is where the invite code, starter kit and Mel credits come from. Ask:
1. Does Creator tier support attaching a phone number?
2. Hosted Mel relay base URL, or local-only?
3. Must the submission be built in Mel for grand-prize eligibility?

## Known constraints

- Twilio trial: outbound only to 5 SMS-verified numbers, 10-min cap, one number.
  A card removes all of it immediately, no approval wait.
- A2P 10DLC gates SMS, not voice. SMS is out either way (takes days).
- **Inbound is far more reliable than outbound for a stage demo.** Build inbound.
- Use `eleven_turbo_v2_5` or Flash with streaming, not multilingual_v2. Telephony latency
  gets roughly 3x worse otherwise.
- Match the Twilio number region to ElevenLabs' serving region.
