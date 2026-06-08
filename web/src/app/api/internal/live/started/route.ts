/**
 * POST /api/internal/live/started   { stream_id, tenant_id, recording_path }
 *
 * Relay tells us the push went live. We flip the tenant's session to live so
 * the dashboard badge reflects reality, and — when "Get Clips" is on —
 * forward the start to NexoClip so it records the stream for clipping.
 * Bearer-authed.
 */

import { NextRequest, NextResponse } from "next/server";
import { checkRelayBearer } from "@/lib/relay-auth";
import { getClipsEnabled, updateSession } from "@/lib/data";
import { nexoclipStarted } from "@/lib/nexoclip";

export async function POST(request: NextRequest): Promise<NextResponse> {
  if (!checkRelayBearer(request.headers.get("authorization"))) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
  let body: { tenant_id?: string; stream_id?: string; recording_path?: string };
  try {
    body = (await request.json()) as typeof body;
  } catch {
    return NextResponse.json({ error: "invalid_json" }, { status: 400 });
  }
  const tenantId = body.tenant_id ?? body.stream_id;
  const streamId = body.stream_id ?? tenantId;
  if (!tenantId || !streamId) {
    return new NextResponse(null, { status: 204 });
  }

  await updateSession(tenantId, { isLive: true });

  // Hand off to NexoClip's tested pipeline when the tenant opted in.
  if (await getClipsEnabled(tenantId)) {
    await nexoclipStarted({
      streamId,
      tenantId,
      recordingPath:
        body.recording_path ?? `/data/live/${streamId}/source`,
    });
  }

  return new NextResponse(null, { status: 204 });
}
