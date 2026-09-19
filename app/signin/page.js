import { signIn, ssoConfigured } from "@/auth";

export const metadata = { title: "Sign in to Iris" };

export default function SignIn() {
  return (
    <main className="min-h-screen grid place-items-center px-6">
      <div className="w-full max-w-sm">
        <h1 className="font-display text-4xl">Iris</h1>
        <p className="mt-2 text-ink-500 text-sm leading-relaxed">
          This console shows customer phone numbers and call transcripts. Sign in with your
          organization account to continue.
        </p>

        {ssoConfigured ? (
          <form
            action={async () => {
              "use server";
              await signIn("ssojet", { redirectTo: "/" });
            }}
            className="mt-7"
          >
            <button className="w-full px-4 py-2.5 rounded-md bg-ink-900 text-ink-50 hover:bg-ink-800 transition-colors">
              Continue with SSO
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
      </div>
    </main>
  );
}
