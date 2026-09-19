import { signIn, ssoConfigured } from "@/auth";

export const metadata = { title: "Iris, try it for yourself" };

const PHONE_DISPLAY = "+1 (786) 600-0275";
const PHONE_TEL = "+17866000275";

const STEPS = [
  {
    n: "1",
    title: "Call the number",
    body: "Iris picks up. Ask what time they open on Monday. Ask to book a cleaning for Tuesday at ten. Then ask for a discount on whitening.",
  },
  {
    n: "2",
    title: "Watch what she will not do",
    body: "She answers the first question from the knowledge base. She writes the booking down but never says it is booked. She refuses the discount and escalates it, because that price is not hers to give.",
  },
  {
    n: "3",
    title: "Sign in and approve it",
    body: "Everything she could not decide is waiting in the console with the transcript behind it. Approve the booking and Iris calls you back to confirm it, in the same voice that took your call.",
  },
];

export default function SignIn() {
  return (
    <main className="min-h-screen px-6 py-12 md:py-16">
      <div className="mx-auto w-full max-w-2xl">
        <h1 className="font-display text-5xl md:text-6xl tracking-tight">Iris</h1>
        <p className="mt-3 text-lg text-ink-700 leading-relaxed">
          An after-hours voice agent that handles the whole call and commits to nothing on
          its own.
        </p>
        <p className="mt-2 text-ink-500 leading-relaxed">
          Anything that costs money or changes a booking waits for a human. Voice agents can
          talk. They can&rsquo;t be trusted to act. This is the layer in between.
        </p>

        {/* the call to action */}
        <div className="mt-8 rounded-xl border border-accent-200 bg-accent-50 p-5">
          <p className="font-mono text-[11px] uppercase tracking-widest text-accent-dark">
            Try it right now
          </p>
          <a
            href={`tel:${PHONE_TEL}`}
            className="mt-2 block font-display text-3xl md:text-4xl text-ink-900 hover:text-accent-dark transition-colors"
          >
            {PHONE_DISPLAY}
          </a>
          <p className="mt-2 text-sm text-ink-600 leading-relaxed">
            A real number, answered by the agent. This is a demo dental practice, so nothing
            you say books anything real.
          </p>
        </div>

        <ol className="mt-8 space-y-5">
          {STEPS.map((s) => (
            <li key={s.n} className="flex gap-4">
              <span className="shrink-0 w-7 h-7 rounded-full bg-ink-900 text-ink-50 font-mono text-xs grid place-items-center">
                {s.n}
              </span>
              <div>
                <h2 className="font-medium text-ink-900">{s.title}</h2>
                <p className="mt-1 text-ink-600 leading-relaxed">{s.body}</p>
              </div>
            </li>
          ))}
        </ol>

        {/* sign in */}
        <div className="mt-10 border-t border-ink-200 pt-8">
          <h2 className="font-display text-2xl">See what happened on your call</h2>
          <p className="mt-2 text-ink-600 leading-relaxed">
            The console shows customer phone numbers and full call transcripts, so it sits
            behind single sign-on rather than being open to anyone with the link. Enter your
            email and you&rsquo;ll get a one-time code, or use Google.
          </p>

          {ssoConfigured ? (
            <form
              action={async () => {
                "use server";
                await signIn("ssojet", { redirectTo: "/" });
              }}
              className="mt-5"
            >
              <button className="w-full sm:w-auto px-6 py-3 rounded-md bg-ink-900 text-ink-50 hover:bg-ink-800 transition-colors">
                Sign in to the console
              </button>
            </form>
          ) : (
            <div className="mt-5 rounded-lg border border-accent-200 bg-accent-50 p-4">
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

          <p className="mt-4 text-xs text-ink-400 leading-relaxed">
            Sign-in is handled by SSOJet. Calls run on ElevenLabs. The summary on every call
            is written by Mel.
          </p>
        </div>
      </div>
    </main>
  );
}
