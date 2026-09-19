# Saturday runbook — Sep 19, 12:30 to 6:00

Solo. 5h30m of build time. Zero slack, so the drop order below is decided in advance.

| Time | Block | Done when |
|---|---|---|
| 12:30-1:00 | Check in. Wifi + phone hotspot as backup. Open Mel, confirm credits | You can reach the internet two ways |
| 1:00-1:45 | **Phone rings, agent answers, holds a conversation** | You called the number and talked to it |
| 1:45-2:45 | Knowledge base + policy prompt (paste from POLICY-PROMPT.md) | It answers a real question correctly and refuses one |
| 2:45-3:15 | `capture_lead` webhook end to end | A row appears in your app from a live call |
| 3:15-4:30 | Console: two-column page, call list + transcript | You can click a call and read it |
| 4:30-5:15 | `propose_booking` + pending queue + Approve/Reject | Approve commits and the caller gets notified |
| 5:15-5:30 | SSOJet login in front of the console | Real SSO login gates the page |
| 5:30-5:45 | **Rehearse 3 times. Record a backup video** | You have the tape |
| 5:45-6:00 | Submit | Submitted |

**1:00-1:45 is the whole day.** If the phone doesn't work, nothing else matters. Do not
start the console before a call connects.

## Drop order (when behind, cut from the bottom up)

1. Mel triage summary — cut first, no one misses it
2. MCP + SSOJet MCP auth — stretch, never load-bearing
3. SSOJet login — $1,188 x 5 winners, but the demo survives without it
4. `propose_change` — `propose_booking` alone proves the pattern

**Never cut:** the live call, the policy refusal, the pending action, the approval that commits.
That sequence IS the submission.

## Rules

- Mel is the tool, Claude Code is the fallback. Switch without hesitation if Mel stalls.
- Commit locally often. Nothing pushed anywhere.
- If something takes 20 minutes longer than budgeted, cut it and move. Check the clock at
  the top of every hour.
