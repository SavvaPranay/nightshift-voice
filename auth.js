import NextAuth from "next-auth";

// SSOJet as a generic OIDC provider. Enterprise SSO in front of the console,
// because it shows customer phone numbers and call transcripts.
const configured = Boolean(
  process.env.SSOJET_ISSUER && process.env.SSOJET_CLIENT_ID && process.env.SSOJET_CLIENT_SECRET
);

export const { handlers, auth, signIn, signOut } = NextAuth({
  trustHost: true,
  debug: process.env.AUTH_DEBUG === "1",
  providers: configured
    ? [
        {
          id: "ssojet",
          name: "SSOJet",
          type: "oidc",
          issuer: process.env.SSOJET_ISSUER,
          clientId: process.env.SSOJET_CLIENT_ID,
          clientSecret: process.env.SSOJET_CLIENT_SECRET,
          authorization: { params: { scope: "openid profile email" } },
          checks: ["pkce", "state", "nonce"],
        },
      ]
    : [],
  logger: {
    error(code, ...m) { console.error("[auth:error]", code, JSON.stringify(m)?.slice(0, 1200)); },
    warn(code) { console.warn("[auth:warn]", code); },
  },
  // On production the SSOJet redirect chain can drop sameSite=lax cookies,
  // which arrives as OAuthCallbackError because state/nonce/pkce are missing.
  // sameSite=none survives the cross-site hop; it requires secure, which https gives us.
  cookies:
    process.env.NODE_ENV === "production"
      ? {
          state: { name: "__Secure-authjs.state", options: { httpOnly: true, sameSite: "none", path: "/", secure: true } },
          nonce: { name: "__Secure-authjs.nonce", options: { httpOnly: true, sameSite: "none", path: "/", secure: true } },
          pkceCodeVerifier: { name: "__Secure-authjs.pkce.code_verifier", options: { httpOnly: true, sameSite: "none", path: "/", secure: true } },
        }
      : undefined,
  pages: { signIn: "/signin" },
  callbacks: {
    session({ session, token }) {
      if (token?.email) session.user.email = token.email;
      return session;
    },
  },
});

// Exported so the UI can explain itself when SSO is not wired up yet.
export const ssoConfigured = configured;
