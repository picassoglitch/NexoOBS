"use client";

import { useOptimistic, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Header } from "@/components/Header";
import { EncoderPanel } from "@/components/EncoderPanel";
import { ChannelsPanel } from "@/components/ChannelsPanel";
import { Footer } from "@/components/Footer";
import { buildIngest } from "@/lib/ingest";
import { StreamPreview } from "@/components/StreamPreview";
import { DestinationConfig, PlatformId } from "@/lib/destinations";
import { ChannelPatch } from "@/components/ChannelEditModal";
import {
  addDestinationAction,
  regenerateKeyAction,
  removeDestinationAction,
  setTitleAction,
  toggleDestinationAction,
  toggleLiveAction,
  toggleRecordAction,
  updateDestinationAction,
  updateTitlesAction,
} from "./actions";

type Dest = DestinationConfig & { id: string };

interface Props {
  initialTitle: string;
  initialIsLive: boolean;
  initialRecord: boolean;
  initialStreamKey: string;
  relayRtmp: string;
  previewEnabled: boolean;
  destinations: Dest[];
}

type OptimisticAction =
  | { type: "toggle"; id: string }
  | { type: "remove"; id: string }
  | { type: "titles"; title: string };

export function DashboardClient({
  initialTitle,
  initialIsLive,
  initialRecord,
  initialStreamKey,
  relayRtmp,
  previewEnabled,
  destinations,
}: Props) {
  const router = useRouter();
  const [title, setTitle] = useState(initialTitle);
  const [isLive, setIsLive] = useState(initialIsLive);
  const [recordEnabled, setRecordEnabled] = useState(initialRecord);
  const [streamKey, setStreamKey] = useState(initialStreamKey);
  const [pending, startTransition] = useTransition();

  // Destinations are server-authoritative (props). useOptimistic gives a
  // snappy local view that reconciles to the server data after each
  // action + router.refresh().
  const [optimistic, applyOptimistic] = useOptimistic(
    destinations,
    (state: Dest[], action: OptimisticAction): Dest[] => {
      switch (action.type) {
        case "toggle":
          return state.map((d) =>
            d.id === action.id ? { ...d, enabled: !d.enabled } : d,
          );
        case "remove":
          return state.filter((d) => d.id !== action.id);
        case "titles":
          return state.map((d) => ({ ...d, streamTitle: action.title }));
      }
    },
  );

  const ingest = buildIngest(streamKey, relayRtmp);

  return (
    <div className="flex flex-col min-h-dvh">
      <Header
        title={title}
        isLive={isLive}
        recordEnabled={recordEnabled}
        onTitleChange={(next) => {
          setTitle(next);
          startTransition(() => setTitleAction(next));
        }}
        onRecordToggle={() => {
          const next = !recordEnabled;
          setRecordEnabled(next);
          startTransition(() => toggleRecordAction(next));
        }}
        onGetClips={() => {
          alert("Get Clips → enviará la sesión a NexoClip");
        }}
      />

      <main className="flex-1 px-4 py-6 sm:px-8 sm:py-8 max-w-7xl mx-auto w-full">
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_380px] gap-6">
          <div className="space-y-6">
            <StreamPreview hlsUrl={previewEnabled ? "/api/preview/index.m3u8" : null} />
            <EncoderPanel
              ingest={ingest}
              isLive={isLive}
              onRegenerateKey={() => {
                startTransition(async () => {
                  const fresh = await regenerateKeyAction();
                  setStreamKey(fresh);
                });
              }}
            />
          </div>
          <ChannelsPanel
            destinations={optimistic}
            busy={pending}
            onToggle={(id) => {
              startTransition(async () => {
                applyOptimistic({ type: "toggle", id });
                await toggleDestinationAction(id);
                router.refresh();
              });
            }}
            onAddChannel={(platformId: PlatformId) => {
              startTransition(async () => {
                await addDestinationAction(platformId);
                router.refresh();
              });
            }}
            onUpdateTitles={() => {
              startTransition(async () => {
                applyOptimistic({ type: "titles", title });
                await updateTitlesAction(title);
                router.refresh();
              });
            }}
            onRemove={(id) => {
              startTransition(async () => {
                applyOptimistic({ type: "remove", id });
                await removeDestinationAction(id);
                router.refresh();
              });
            }}
            onSaveDestination={(id, patch: ChannelPatch) => {
              startTransition(async () => {
                await updateDestinationAction(id, patch);
                router.refresh();
              });
            }}
          />
        </div>

        <div className="mt-6 flex justify-center">
          <button
            onClick={() => {
              const next = !isLive;
              setIsLive(next);
              startTransition(() => toggleLiveAction(next));
            }}
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
