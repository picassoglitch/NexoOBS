import Link from "next/link";

/**
 * Landing — Phase 0: tells the visitor what NexoOBS is and links to the
 * dashboard. Once Supabase auth is wired, this redirects logged-in users
 * straight to /dashboard and unauthenticated users to /login.
 */
export default function HomePage() {
  return (
    <div className="flex-1 flex items-center justify-center px-6 py-16">
      <div className="max-w-md text-center">
        <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-accent-soft/40 border border-accent/30 text-[10px] font-bold tracking-wider text-accent mb-6">
          <span className="w-1.5 h-1.5 rounded-full bg-accent" />
          PHASE 0 · WEB PREVIEW
        </div>
        <h1 className="text-3xl sm:text-4xl font-bold text-text-primary mb-3">
          NexoOBS
        </h1>
        <p className="text-text-secondary text-sm leading-relaxed mb-8">
          Multistream a Kick · Twitch · YouTube · TikTok · Facebook con un solo
          push RTMP. Chat unificado y clips generados por NexoClip.
        </p>
        <Link
          href="/dashboard"
          className="inline-block px-6 py-3 rounded-lg bg-accent text-white font-semibold text-sm hover:opacity-90 transition"
        >
          Abrir dashboard →
        </Link>
        <p className="text-[11px] text-text-tertiary mt-6">
          Phase 0 corre con datos mock. El relay real aterriza en la siguiente fase.
        </p>
      </div>
    </div>
  );
}
