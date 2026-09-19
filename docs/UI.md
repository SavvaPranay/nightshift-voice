# UI decision — reuse the portfolio theme

Design decision recorded pre-event. The tailwind config is ~40 lines and gets retyped
Saturday inside the build window. Source of truth: `the personal design system`.

## Tokens

```js
colors: {
  ink:    { 50:'#fafaf9', 100:'#f5f5f4', 200:'#e7e5e4', 300:'#d6d3d1', 400:'#a8a29e',
            500:'#78716c', 600:'#57534e', 700:'#44403c', 800:'#292524', 900:'#1c1917',
            950:'#0c0a09' },
  accent: { DEFAULT:'#c45d3e', light:'#e8855f', dark:'#9e3d22' },   // terracotta
  sage:   { DEFAULT:'#4a7c6f', light:'#6ba393' },                    // green
}
fontFamily: {
  display: ['"Instrument Serif"', 'Georgia', 'serif'],
  body:    ['"Satoshi"', '"DM Sans"', 'system-ui', 'sans-serif'],
  mono:    ['"JetBrains Mono"', 'monospace'],
}
```

## Semantic mapping for the console

| Meaning | Token | Where |
|---|---|---|
| Surfaces, text, borders | `ink` scale | Background `ink-50`, text `ink-900`, borders `ink-200` |
| **Pending / escalated** | `accent` (terracotta) | The badge, the pending card, the ⚠️ marker |
| **Committed / approved** | `sage` | Confirmed state after Approve |
| Live call indicator | `accent` dot, pulsing | Top of the call list |
| Phone numbers, timestamps, tool names | `font-mono` | Transcript metadata |
| Page + panel headings | `font-display` (Instrument Serif) | Gives it character vs default dashboards |
| Transcript body, UI text | `font-body` | Everything else |

Terracotta for pending and sage for committed is the whole visual story: warm means
someone still has to decide, green means a human decided.

## What NOT to carry over

- The portfolio's marketing layout, hero sections, scroll animations
- `fade-up` / `slide-up` on everything. A console needs density, not choreography.
  One subtle animation on a new call arriving is enough
- Dark mode. `darkMode: 'class'` exists in the portfolio; skip it Saturday, no time

## Font loading gotcha

**Instrument Serif** is on Google Fonts, easy. **Satoshi** is Fontshare, not Google, so it
needs a separate stylesheet and will cost time. On Saturday load Instrument Serif from
Google and let body text fall through to `DM Sans` / `system-ui`. Nobody will notice, and
the serif headings carry the identity.
