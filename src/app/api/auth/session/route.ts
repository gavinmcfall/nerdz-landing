import { getAuthEnv } from "@/lib/auth/env";
import { readSession } from "@/lib/auth/session";

export const dynamic = "force-dynamic";

// Tells the client ONLY whether it's signed in (and via which provider) —
// the opaque uid never leaves the server.
export async function GET(req: Request) {
  const headers = { "Cache-Control": "no-store" };
  try {
    const env = await getAuthEnv();
    const session = await readSession(req, env.AUTH_SECRET);
    if (!session) return Response.json({ signedIn: false }, { headers });
    return Response.json(
      { signedIn: true, provider: session.provider },
      { headers },
    );
  } catch {
    // Secrets not configured yet — behave as signed out, not as an error.
    return Response.json({ signedIn: false }, { headers });
  }
}
