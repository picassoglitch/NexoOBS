import { redirect } from "next/navigation";
import { getServerSession } from "@/lib/server-session";
import { isSupabaseConfigured } from "@/lib/supabase";
import { getDestinations, getOrCreateSession } from "@/lib/data";
import { DashboardClient } from "./DashboardClient";

// Per-tenant data — never cache across requests.
export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const session = await getServerSession();
  if (!session) redirect("/login?next=/dashboard");

  // If the DB isn't configured yet, surface a clear message instead of a
  // 500 — keeps the deploy diagnosable.
  if (!isSupabaseConfigured()) {
    return (
      <div className="flex-1 flex items-center justify-center px-6 py-16 text-center">
        <div className="max-w-md">
          <h1 className="text-xl font-bold mb-2">Base de datos no configurada</h1>
          <p className="text-text-tertiary text-sm">
            Falta <code className="font-mono">NEXOOBS_SUPABASE_URL</code> y{" "}
            <code className="font-mono">NEXOOBS_SUPABASE_SECRET_KEY</code>{" "}
            en Railway. El multi-tenant no puede cargar sin ellas.
          </p>
        </div>
      </div>
    );
  }

  const tenantId = session.tenant_id;
  const [tenantSession, destinations] = await Promise.all([
    getOrCreateSession(tenantId),
    getDestinations(tenantId),
  ]);

  // The reachable RTMP endpoint of the relay (Railway TCP-proxy host:port).
  // Set in Railway as NEXOOBS_RELAY_RTMP_URL.
  const relayRtmp =
    process.env.NEXOOBS_RELAY_RTMP_URL ?? "rtmp://ingest.nexo-ai.world/live";
  // Preview is available when the relay's private HLS address is set; the
  // player then pulls from the authenticated same-origin proxy.
  const previewEnabled = Boolean(process.env.NEXOOBS_RELAY_INTERNAL_HLS);
  // The NexoClip connection switch is full-access only. SSO tier arrives
  // lowercased ('all_access').
  const isFullAccess = (session.tier ?? "").toLowerCase() === "all_access";

  return (
    <DashboardClient
      initialTitle={tenantSession.title}
      initialIsLive={tenantSession.isLive}
      initialRecord={tenantSession.recordEnabled}
      initialClips={tenantSession.clipsEnabled}
      initialStreamKey={tenantSession.streamKey}
      relayRtmp={relayRtmp}
      previewEnabled={previewEnabled}
      isFullAccess={isFullAccess}
      destinations={destinations}
    />
  );
}
