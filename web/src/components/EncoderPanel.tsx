"use client";

import { useMemo, useState } from "react";
import { IngestCredentials } from "@/lib/ingest";
import { CopyIcon, RefreshIcon } from "./icons";

type Protocol = "rtmp" | "rtmps" | "srt" | "whip";

const TABS: { id: Protocol; label: string; badge?: string }[] = [
  { id: "rtmp", label: "RTMP" },
  { id: "rtmps", label: "RTMPS" },
  { id: "srt", label: "SRT" },
  { id: "whip", label: "WHIP", badge: "BETA" },
];

interface EncoderPanelProps {
  ingest: IngestCredentials;
  isLive: boolean;
  onRegenerateKey: () => void;
}

export function EncoderPanel({
  ingest,
  isLive,
  onRegenerateKey,
}: EncoderPanelProps) {
  const [protocol, setProtocol] = useState<Protocol>("rtmp");
  const [keyVisible, setKeyVisible] = useState(false);

  const url = useMemo(() => {
    switch (protocol) {
      case "rtmp":
        return ingest.rtmpUrl;
      case "rtmps":
        return ingest.rtmpsUrl;
      case "srt":
        return ingest.srtUrl;
      case "whip":
        return ingest.whipUrl;
    }
  }, [protocol, ingest]);

  const showKeyField = protocol !== "srt"; // SRT carries the key in streamid

  return (
    <section className="rounded-2xl bg-surface border border-border p-6 sm:p-8 relative overflow-hidden">
      <span
        className={`absolute top-4 left-4 inline-flex items-center gap-1.5 px-2 py-1 rounded-md text-[10px] font-bold tracking-wider ${
          isLive
            ? "bg-bad/15 text-bad"
            : "bg-surface-high text-text-tertiary"
        }`}
      >
        {isLive && <span className="w-1.5 h-1.5 rounded-full bg-bad animate-pulse" />}
        {isLive ? "LIVE" : "OFFLINE"}
      </span>

      <div className="text-center mb-5 mt-2">
        <h2 className="text-xl font-bold text-text-primary">
          Connect your encoder
        </h2>
        <p className="text-xs text-text-tertiary mt-1">
          Copia y pega estos datos en OBS, vMix, tu Osmo o cualquier encoder RTMP.
        </p>
      </div>

      <div
        role="tablist"
        className="inline-flex p-1 rounded-lg bg-surface-elevated border border-border mb-5"
      >
        {TABS.map((t) => (
          <button
            key={t.id}
            role="tab"
            aria-selected={protocol === t.id}
            onClick={() => setProtocol(t.id)}
            className={`px-3.5 py-1.5 text-xs font-bold tracking-wider rounded-md transition flex items-center gap-1.5 ${
              protocol === t.id
                ? "bg-bg text-text-primary"
                : "text-text-tertiary hover:text-text-secondary"
            }`}
          >
            {t.label}
            {t.badge && (
              <span className="text-[9px] px-1.5 py-0.5 rounded bg-accent-soft text-accent border border-accent/30">
                {t.badge}
              </span>
            )}
          </button>
        ))}
      </div>

      <Field label={`${protocol.toUpperCase()} URL`} value={url} />

      {showKeyField && (
        <div className="mt-3">
          <Field
            label="Stream key"
            value={ingest.streamKey}
            secret
            visible={keyVisible}
            onToggleVisible={() => setKeyVisible((v) => !v)}
            onRegenerate={onRegenerateKey}
          />
        </div>
      )}

      {protocol === "rtmp" && (
        <div className="mt-3">
          <Field label="URL completa (cámaras de un solo campo)" value={ingest.fullRtmpUrl} />
          <p className="text-[10px] text-text-tertiary mt-1.5 leading-relaxed">
            Para DJI Osmo / Mimo, GoPro o el teléfono — que solo tienen un campo
            de URL — pega esta. Ya incluye tu stream key.
          </p>
        </div>
      )}

      <div className="mt-5 rounded-lg bg-accent-soft/40 border border-accent/30 p-3 flex items-center justify-between gap-3">
        <p className="text-xs text-text-secondary">
          ¿Evento importante?{" "}
          <button className="text-accent font-semibold hover:underline">
            Get backup stream
          </button>
        </p>
        <button className="text-text-tertiary hover:text-text-primary text-lg leading-none">
          ×
        </button>
      </div>

      <div className="mt-4 text-center">
        <button className="text-xs text-accent hover:underline font-medium">
          ▶ Cómo conectar OBS, Zoom, vMix
        </button>
      </div>
    </section>
  );
}

interface FieldProps {
  label: string;
  value: string;
  secret?: boolean;
  visible?: boolean;
  onToggleVisible?: () => void;
  onRegenerate?: () => void;
}

function Field({
  label,
  value,
  secret,
  visible,
  onToggleVisible,
  onRegenerate,
}: FieldProps) {
  const [copied, setCopied] = useState(false);
  const displayValue = secret && !visible ? "•".repeat(Math.min(value.length, 40)) : value;

  return (
    <div>
      <label className="block text-[10px] font-bold tracking-[0.1em] text-text-tertiary uppercase mb-2">
        {label}
      </label>
      <div className="flex items-stretch gap-1 rounded-lg bg-surface-elevated border border-border overflow-hidden">
        <button
          type="button"
          onClick={() => onToggleVisible?.()}
          disabled={!secret}
          className="flex-1 text-left px-3.5 py-2.5 font-mono text-xs text-text-secondary truncate disabled:cursor-default"
        >
          {displayValue}
        </button>
        {onRegenerate && (
          <button
            type="button"
            onClick={onRegenerate}
            className="px-3 text-text-tertiary hover:text-text-primary hover:bg-surface-high transition"
            aria-label="Regenerar clave"
            title="Regenerar"
          >
            <RefreshIcon className="w-4 h-4" />
          </button>
        )}
        <button
          type="button"
          onClick={async () => {
            try {
              await navigator.clipboard.writeText(value);
              setCopied(true);
              setTimeout(() => setCopied(false), 1400);
            } catch {
              // noop — clipboard unavailable
            }
          }}
          className="px-3 text-text-tertiary hover:text-text-primary hover:bg-surface-high transition"
          aria-label="Copiar"
          title={copied ? "¡Copiado!" : "Copiar"}
        >
          <CopyIcon className="w-4 h-4" />
        </button>
      </div>
      {copied && (
        <span className="text-[10px] text-good mt-1 inline-block">
          Copiado al portapapeles
        </span>
      )}
    </div>
  );
}
