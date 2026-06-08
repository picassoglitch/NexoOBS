"use client";

import { useState } from "react";
import { Header } from "@/components/Header";
import { EncoderPanel } from "@/components/EncoderPanel";
import { ChannelsPanel } from "@/components/ChannelsPanel";
import { Footer } from "@/components/Footer";
import {
  IngestCredentials,
  MOCK_DESTINATIONS,
  MOCK_SESSION,
} from "@/lib/mock-data";
import { DestinationConfig } from "@/lib/destinations";

export default function DashboardPage() {
  const [title, setTitle] = useState(MOCK_SESSION.title);
  const [isLive, setIsLive] = useState(MOCK_SESSION.isLive);
  const [recordEnabled, setRecordEnabled] = useState(MOCK_SESSION.recordEnabled);
  const [ingest, setIngest] = useState<IngestCredentials>(MOCK_SESSION.ingest);
  const [destinations, setDestinations] =
    useState<DestinationConfig[]>(MOCK_DESTINATIONS);

  const handleRegenerateKey = () => {
    // Phase 0: client-side mock. Real impl calls relay API to rotate.
    const fresh = `nexo_live_${randomHex(32)}`;
    setIngest((prev) => ({ ...prev, streamKey: fresh }));
  };

  const handleToggle = (index: number) => {
    setDestinations((prev) =>
      prev.map((d, i) => (i === index ? { ...d, enabled: !d.enabled } : d)),
    );
  };

  return (
    <div className="flex flex-col min-h-dvh">
      <Header
        title={title}
        isLive={isLive}
        recordEnabled={recordEnabled}
        onTitleChange={setTitle}
        onRecordToggle={() => setRecordEnabled((v) => !v)}
        onGetClips={() => {
          // Phase 0 stub. Real impl posts session+timestamp to NexoClip.
          alert("Get Clips → enviará la sesión a NexoClip");
        }}
      />

      <main className="flex-1 px-4 py-6 sm:px-8 sm:py-8 max-w-7xl mx-auto w-full">
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_380px] gap-6">
          <EncoderPanel
            ingest={ingest}
            isLive={isLive}
            onRegenerateKey={handleRegenerateKey}
          />
          <ChannelsPanel
            destinations={destinations}
            onToggle={handleToggle}
            onAddChannel={() => alert("Add Channel → OAuth flow")}
            onUpdateTitles={() =>
              setDestinations((prev) =>
                prev.map((d) => ({ ...d, streamTitle: title })),
              )
            }
            onReconnect={(i) =>
              alert(`Reconnect ${destinations[i]?.channelHandle ?? ""} → OAuth refresh`)
            }
            onApply={(i) =>
              alert(`Apply para ${destinations[i]?.channelHandle ?? ""}`)
            }
          />
        </div>

        {/* Dev-only: simulate going live without a real encoder connected. */}
        <div className="mt-6 flex justify-center">
          <button
            onClick={() => setIsLive((v) => !v)}
            className="text-[10px] tracking-widest font-bold text-text-tertiary hover:text-text-primary px-3 py-1.5 rounded border border-border bg-surface"
          >
            DEV · TOGGLE {isLive ? "OFFLINE" : "LIVE"}
          </button>
        </div>
      </main>

      <Footer />
    </div>
  );
}

function randomHex(len: number): string {
  const bytes = new Uint8Array(Math.ceil(len / 2));
  if (typeof crypto !== "undefined" && crypto.getRandomValues) {
    crypto.getRandomValues(bytes);
  } else {
    for (let i = 0; i < bytes.length; i++) {
      bytes[i] = Math.floor(Math.random() * 256);
    }
  }
  return Array.from(bytes)
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("")
    .slice(0, len);
}
