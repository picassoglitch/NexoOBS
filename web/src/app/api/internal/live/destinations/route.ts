/**
 * GET /api/internal/live/destinations?stream_id=<tenant_id>
 *
 * Called by the nexoclip-live relay's on_ready hook to fan the single
 * ingest out to every enabled + configured platform. Returns each as a
 * complete RTMP push URL (ingest + key) the relay feeds to
 * `ffmpeg -c copy -f flv`.
 *
 * Contract (matches nexoclip-live/scripts/on_ready.sh):
 *   Auth:  Authorization: Bearer <NEXOOBS_RELAY_SECRET>
 *   200:   { destinations: [{ platform, push_url }] }
 */

import { NextRequest, NextResponse } from "next/server";
import { checkRelayBearer } from "@/lib/relay-auth";
import { getFanoutDestinations } from "@/lib/data";

export async function GET(request: NextRequest): Promise<NextResponse> {
  if (!checkRelayBearer(request.headers.get("authorization"))) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const streamId = request.nextUrl.searchParams.get("stream_id");
  if (!streamId) {
    return NextResponse.json({ destinations: [] });
  }

  // stream_id == tenant_id (see authorize route).
  const destinations = await getFanoutDestinations(streamId);
  return NextResponse.json({ destinations });
}
