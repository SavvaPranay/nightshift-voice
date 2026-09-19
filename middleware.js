import { auth } from "@/auth";

// Protect the console. Tool webhooks stay open: ElevenLabs calls them
// machine-to-machine and cannot carry a session cookie.
export default auth((req) => {
  const ssoOn = Boolean(
    process.env.SSOJET_ISSUER && process.env.SSOJET_CLIENT_ID && process.env.SSOJET_CLIENT_SECRET
  );
  if (!ssoOn) return;
  if (req.auth) return;

  const url = new URL("/signin", req.nextUrl.origin);
  return Response.redirect(url);
});

export const config = {
  matcher: ["/((?!api|signin|_next/static|_next/image|favicon.ico).*)"],
};
