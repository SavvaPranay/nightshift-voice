import { signIn, ssoConfigured } from "@/auth";

export const metadata = { title: "Iris, try it for yourself" };

const PHONE_DISPLAY = "+1 (786) 600-0275";
const PHONE_TEL = "+17866000275";

const STEPS = [
  {
    n: "1",
    title: "Call the number",
    body: "Ask what time they open Monday. Ask to book a cleaning Tuesday at ten. Then ask for a discount on whitening.",
  },
  {
    n: "2",
    title: "Watch what she will not do",
    body: "She answers the first one. She writes the booking down but never says it is booked. She refuses the discount, because that price is not hers to give.",
  },
  {
    n: "3",
    title: "Approve it and your phone rings",
    body: "Everything she could not decide is waiting in the console. Approve the booking and Iris calls you back to confirm it.",
  },
];

export default function SignIn() {
  return (
    <main className="min-h-screen lg:h-screen lg:overflow-hidden grid grid-cols-1 lg:grid-cols-[1.15fr_1fr]">
      {/* left: what it is and how to try it */}
      <section className="px-6 py-12 lg:px-12 lg:py-0 lg:h-screen lg:overflow-y-auto flex flex-col justify-center">
        <div className="w-full max-w-xl mx-auto lg:mx-0">
          <h1 className="font-display text-5xl xl:text-6xl tracking-tight">Iris</h1>
          <p className="mt-3 text-lg text-ink-700 leading-relaxed">
            An after-hours voice agent that handles the whole call and commits to nothing on
            its own.
          </p>
          <p className="mt-2 text-ink-500 leading-relaxed">
            Voice agents can talk. They can&rsquo;t be trusted to act. This is the layer in
            between.
          </p>

          <div className="mt-7 rounded-xl border border-accent-200 bg-accent-50 p-5">
            <p className="font-mono text-[11px] uppercase tracking-widest text-accent-dark">
              Try it right now
            </p>
            <a
              href={`tel:${PHONE_TEL}`}
              className="mt-2 block font-display text-3xl xl:text-4xl text-ink-900 hover:text-accent-dark transition-colors"
            >
              {PHONE_DISPLAY}
            </a>
            <p className="mt-2 text-sm text-ink-600 leading-relaxed">
              A real number, answered by the agent. It is a demo dental practice, so nothing
              you say books anything real.
            </p>
          </div>

          <ol className="mt-7 space-y-4">
            {STEPS.map((s) => (
              <li key={s.n} className="flex gap-3.5">
                <span className="shrink-0 w-6 h-6 mt-0.5 rounded-full bg-ink-900 text-ink-50 font-mono text-[11px] grid place-items-center">
                  {s.n}
                </span>
                <div>
                  <h2 className="font-medium text-ink-900 leading-snug">{s.title}</h2>
                  <p className="mt-0.5 text-sm text-ink-600 leading-relaxed">{s.body}</p>
                </div>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* right: sign in */}
      <section className="border-t lg:border-t-0 lg:border-l border-ink-200 bg-ink-100/60 px-6 py-12 lg:px-12 lg:h-screen flex flex-col justify-center">
        <div className="w-full max-w-sm mx-auto lg:mx-0">
          <h2 className="font-display text-3xl">See what happened on your call</h2>
          <p className="mt-3 text-ink-600 leading-relaxed">
            The console shows customer phone numbers and full call transcripts, so it sits
            behind single sign-on rather than being open to anyone with the link.
          </p>
          <p className="mt-2 text-ink-600 leading-relaxed">
            Enter your email and you&rsquo;ll get a one-time code, or continue with Google.
          </p>

          {ssoConfigured ? (
            <form
              action={async () => {
                "use server";
                await signIn("ssojet", { redirectTo: "/" });
              }}
              className="mt-7"
            >
              <button className="w-full px-6 py-3 rounded-md bg-ink-900 text-ink-50 hover:bg-ink-800 transition-colors">
                Sign in to the console
              </button>
            </form>
          ) : (
            <div className="mt-7 rounded-lg border border-accent-200 bg-accent-50 p-4">
              <p className="font-mono text-[11px] uppercase tracking-widest text-accent-dark">
                SSO not configured
              </p>
              <p className="mt-1.5 text-sm text-ink-700 leading-relaxed">
                Set <code className="font-mono text-xs">SSOJET_ISSUER</code>,{" "}
                <code className="font-mono text-xs">SSOJET_CLIENT_ID</code> and{" "}
                <code className="font-mono text-xs">SSOJET_CLIENT_SECRET</code>, then restart.
              </p>
            </div>
          )}

          <p className="mt-6 text-xs text-ink-400 leading-relaxed">
            Sign-in by SSOJet. Calls run on ElevenLabs. The summary on every call is written
            by Mel.
          </p>
        </div>
      </section>
    </main>
  );
}
