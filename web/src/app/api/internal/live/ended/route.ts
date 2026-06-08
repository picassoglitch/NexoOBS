/**
 * POST /api/internal/live/ended   { stream_id }
 *
 * Relay tells us the publisher disconnected. We flip the tenant's session
 * back to offline. stream_id == tenant_id (see authorize route). Bearer-authed.
 *
 * Later: this is where we'd POST the recording handoff to NexoClip for
 * auto-clipping (the "Get Clips" path).
 */

import { NextRequest, NextResponse } from "next/server";
import { checkRelayBearer } from "@/lib/relay-auth";
import { updateSession } from "@/lib/data";

export async function POST(request: NextRequest): Promise<NextResponse> {
  if (!checkRelayBearer(request.headers.get("authorization"))) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
  let body: { stream_id?: string };
  try {
    body = (await request.json()) as { stream_id?: string };
  } catch {
    return NextResponse.json({ error: "invalid_json" }, { status: 400 });
  }
  if (body.stream_id) {
    await updateSession(body.stream_id, { isLive: false });
  }
  return new NextResponse(null, { status: 204 });
}
