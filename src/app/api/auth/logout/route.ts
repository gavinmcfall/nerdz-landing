import { SESSION_COOKIE, clearCookieHeader } from "@/lib/auth/session";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  return Response.json(
    { signedIn: false },
    {
      headers: {
        "Set-Cookie": clearCookieHeader(req, SESSION_COOKIE),
        "Cache-Control": "no-store",
      },
    },
  );
}
