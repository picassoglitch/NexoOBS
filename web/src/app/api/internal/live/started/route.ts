/**
 * POST /api/internal/live/started   { stream_id, tenant_id, recording_path }
 *
 * Relay tells us the push went live. We flip the tenant's session to live so
 * the dashboard badge reflects reality. Bearer-authed.
 */

import { NextRequest, NextResponse } from "next/server";
import { checkRelayBearer } from "@/lib/relay-auth";
import { updateSession } from "@/lib/data";

export async function POST(request: NextRequest): Promise<NextResponse> {
  if (!checkRelayBearer(request.headers.get("authorization"))) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
  let body: { tenant_id?: string; stream_id?: string };
  try {
    body = (await request.json()) as { tenant_id?: string; stream_id?: string };
  } catch {
    return NextResponse.json({ error: "invalid_json" }, { status: 400 });
  }
  const tenantId = body.tenant_id ?? body.stream_id;
  if (tenantId) {
    await updateSession(tenantId, { isLive: true });
  }
  return new NextResponse(null, { status: 204 });
}
