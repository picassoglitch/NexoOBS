/**
 * POST /api/internal/live/ended   { stream_id, duration_s? }
 *
 * Relay tells us the publisher disconnected. We flip the tenant's session
 * back to offline and — when "Get Clips" is on — forward the end to
 * NexoClip, which runs its auto-clip pipeline on the recording.
 * stream_id == tenant_id (see authorize route). Bearer-authed.
 */

import { NextRequest, NextResponse } from "next/server";
import { checkRelayBearer } from "@/lib/relay-auth";
import { getClipsEnabled, updateSession } from "@/lib/data";
import { nexoclipEnded } from "@/lib/nexoclip";

export async function POST(request: NextRequest): Promise<NextResponse> {
  if (!checkRelayBearer(request.headers.get("authorization"))) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
  let body: { stream_id?: string; duration_s?: number };
  try {
    body = (await request.json()) as typeof body;
  } catch {
    return NextResponse.json({ error: "invalid_json" }, { status: 400 });
  }
  const streamId = body.stream_id;
  if (!streamId) return new NextResponse(null, { status: 204 });

  // stream_id == tenant_id.
  await updateSession(streamId, { isLive: false });

  if (await getClipsEnabled(streamId)) {
    await nexoclipEnded({
      streamId,
      tenantId: streamId, // stream_id == tenant_id (Nexo AI user id)
      durationS: typeof body.duration_s === "number" ? body.duration_s : undefined,
    });
  }

  return new NextResponse(null, { status: 204 });
}
