"use client";

import { useEffect, useRef, useState } from "react";
import Hls from "hls.js";

type State = "waiting" | "live" | "unconfigured";

interface Props {
  /** HLS manifest URL, or null when the relay HLS base isn't configured. */
  hlsUrl: string | null;
}

/**
 * Live preview player. Pulls HLS from the relay (MediaMTX). The manifest
 * only exists while an encoder is pushing, so we retry until it appears,
 * then play. Falls back to a "no signal" placeholder otherwise.
 *
 * HLS (not WebRTC) because Railway's HTTP proxy is TCP-only — HLS rides
 * entirely over HTTP and works through the proxy; WebRTC's UDP/ICE doesn't.
 */
export function StreamPreview({ hlsUrl }: Props) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [state, setState] = useState<State>(
    hlsUrl ? "waiting" : "unconfigured",
  );

  useEffect(() => {
    if (!hlsUrl) {
      setState("unconfigured");
      return;
    }
    const video = videoRef.current;
    if (!video) return;

    let cancelled = false;
    let hls: Hls | null = null;
    let retryTimer: ReturnType<typeof setTimeout> | null = null;

    const scheduleRetry = () => {
      if (cancelled) return;
      setState("waiting");
      retryTimer = setTimeout(start, 4000);
    };

    const start = () => {
      if (cancelled) return;

      // Safari / iOS: native HLS.
      if (video.canPlayType("application/vnd.apple.mpegurl")) {
        video.src = hlsUrl;
        video
          .play()
          .then(() => !cancelled && setState("live"))
          .catch(scheduleRetry);
        const onErr = () => scheduleRetry();
        video.addEventListener("error", onErr, { once: true });
        return;
      }

      if (!Hls.isSupported()) {
        setState("waiting");
        return;
      }

      hls = new Hls({ lowLatencyMode: true, liveSyncDurationCount: 3 });
      hls.loadSource(hlsUrl);
      hls.attachMedia(video);
      hls.on(Hls.Events.MANIFEST_PARSED, () => {
        if (cancelled) return;
        video.play().catch(() => {});
        setState("live");
      });
      hls.on(Hls.Events.ERROR, (_evt, data) => {
        if (!data.fatal) return;
        // Manifest 404 (no publisher yet) or network blip → tear down + retry.
        hls?.destroy();
        hls = null;
        scheduleRetry();
      });
    };

    start();

    return () => {
      cancelled = true;
      if (retryTimer) clearTimeout(retryTimer);
      hls?.destroy();
    };
  }, [hlsUrl]);

  return (
    <div className="rounded-2xl bg-surface border border-border overflow-hidden">
      <div className="relative aspect-video bg-black">
        <video
          ref={videoRef}
          className={`w-full h-full object-contain ${state === "live" ? "" : "opacity-0"}`}
          muted
          playsInline
          controls={state === "live"}
        />
        {state !== "live" && (
          <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-6">
            <div className="w-12 h-12 rounded-full border border-border flex items-center justify-center mb-3">
              <span className="w-2.5 h-2.5 rounded-full bg-text-tertiary" />
            </div>
            {state === "unconfigured" ? (
              <>
                <p className="text-sm font-semibold text-text-secondary">
                  Preview no disponible
                </p>
                <p className="text-[11px] text-text-tertiary mt-1 max-w-xs">
                  El relay aún no expone HLS. Configura{" "}
                  <code className="font-mono">NEXOOBS_RELAY_HLS_URL</code> y
                  habilita HLS en MediaMTX.
                </p>
              </>
            ) : (
              <>
                <p className="text-sm font-semibold text-text-secondary">
                  Esperando señal…
                </p>
                <p className="text-[11px] text-text-tertiary mt-1 max-w-xs">
                  Conecta tu encoder al relay. El preview aparece unos segundos
                  después de empezar a transmitir.
                </p>
              </>
            )}
          </div>
        )}
        {state === "live" && (
          <span className="absolute top-3 left-3 inline-flex items-center gap-1.5 px-2 py-1 rounded-md bg-bad/80 text-white text-[10px] font-bold tracking-wider">
            <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
            LIVE
          </span>
        )}
      </div>
    </div>
  );
}
