import { z } from "zod";
import { NO_STORE, planAccess } from "@/lib/warcraft/plan-server";
import { parsePlan, readPlan, savePlan } from "@/lib/warcraft/plan";

export const dynamic = "force-dynamic";

// The plan and whether the caller may edit it. Anyone can read.
export async function GET(req: Request) {
  const access = await planAccess(req);
  const plan = await readPlan(access.kv);
  return Response.json({ plan, signedIn: access.signedIn, editor: access.editor }, { headers: NO_STORE });
}

const PutSchema = z.object({ base: z.string(), plan: z.unknown() });

// Replace the plan. Editors only; 409 with the stored plan when `base` is stale.
export async function PUT(req: Request) {
  const access = await planAccess(req);
  if (!access.editor) {
    return Response.json(
      { error: access.signedIn ? "not an editor" : "not signed in" },
      { status: access.signedIn ? 403 : 401, headers: NO_STORE },
    );
  }
  if (!access.kv) return Response.json({ error: "storage unavailable" }, { status: 503, headers: NO_STORE });

  const body = PutSchema.safeParse(await req.json().catch(() => null));
  const plan = body.success ? parsePlan(body.data.plan) : null;
  if (!body.success || !plan) return Response.json({ error: "bad plan" }, { status: 400, headers: NO_STORE });

  const result = await savePlan(access.kv, body.data.base, plan);
  if (!result.ok) return Response.json({ error: result.error, plan: result.plan }, { status: result.status, headers: NO_STORE });
  return Response.json({ plan: result.plan }, { headers: NO_STORE });
}
