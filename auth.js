import NextAuth from "next-auth";

// SSOJet as a generic OIDC provider. Enterprise SSO in front of the console,
// because it shows customer phone numbers and call transcripts.
const configured = Boolean(
  process.env.SSOJET_ISSUER && process.env.SSOJET_CLIENT_ID && process.env.SSOJET_CLIENT_SECRET
);

export const { handlers, auth, signIn, signOut } = NextAuth({
  trustHost: true,
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
          checks: ["pkce", "state"],
        },
      ]
    : [],
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
