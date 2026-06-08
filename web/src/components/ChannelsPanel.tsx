"use client";

import { useState } from "react";
import {
  avatarInitial,
  DestinationConfig,
  DestinationStatus,
  PLATFORM_META,
  PLATFORM_ORDER,
  PlatformId,
} from "@/lib/destinations";
import {
  AlertIcon,
  BroadcastIcon,
  ChatIcon,
  EditIcon,
  MonitorIcon,
  PlusIcon,
} from "./icons";

type Dest = DestinationConfig & { id: string };

interface ChannelsPanelProps {
  destinations: Dest[];
  onToggle: (id: string) => void;
  onAddChannel: (platformId: PlatformId) => void;
  onUpdateTitles: () => void;
  onRemove: (id: string) => void;
  busy?: boolean;
}

type Tab = "channels" | "chat";

export function ChannelsPanel(props: ChannelsPanelProps) {
  const [tab, setTab] = useState<Tab>("channels");
  const activeCount = props.destinations.filter((d) => d.enabled).length;

  return (
    <section className="rounded-2xl bg-surface border border-border flex flex-col overflow-hidden min-h-[420px]">
      <div className="flex p-1 m-3 mb-0 rounded-lg bg-surface-elevated border border-border">
        <TabButton
          icon={<BroadcastIcon className="w-4 h-4" />}
          label="Channels"
          active={tab === "channels"}
          onClick={() => setTab("channels")}
        />
        <TabButton
          icon={<ChatIcon className="w-4 h-4" />}
          label="Chat"
          active={tab === "chat"}
          onClick={() => setTab("chat")}
        />
      </div>

      {tab === "channels" ? (
        <ChannelsTab
          activeCount={activeCount}
          total={props.destinations.length}
          destinations={props.destinations}
          onToggle={props.onToggle}
          onAddChannel={props.onAddChannel}
          onUpdateTitles={props.onUpdateTitles}
          onRemove={props.onRemove}
          busy={props.busy}
        />
      ) : (
        <ChatTab />
      )}
    </section>
  );
}

function TabButton({
  icon,
  label,
  active,
  onClick,
}: {
  icon: React.ReactNode;
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-md text-xs font-semibold transition ${
        active
          ? "bg-bg text-text-primary"
          : "text-text-tertiary hover:text-text-secondary"
      }`}
    >
      {icon}
      {label}
    </button>
  );
}

function ChannelsTab({
  destinations,
  activeCount,
  total,
  onToggle,
  onAddChannel,
  onUpdateTitles,
  onRemove,
  busy,
}: {
  destinations: Dest[];
  activeCount: number;
  total: number;
  onToggle: (id: string) => void;
  onAddChannel: (platformId: PlatformId) => void;
  onUpdateTitles: () => void;
  onRemove: (id: string) => void;
  busy?: boolean;
}) {
  const [picking, setPicking] = useState(false);

  // Platforms that broadcast and aren't connected yet.
  const used = new Set(destinations.map((d) => d.platformId));
  const available = PLATFORM_ORDER.filter(
    (id) => PLATFORM_META[id].supportsBroadcast && !used.has(id),
  );

  return (
    <div className="flex flex-col flex-1">
      <div className="flex items-center justify-between px-4 pt-4 pb-2">
        <h3 className="text-sm font-bold">Your Channels</h3>
        <button className="text-xs text-text-secondary hover:text-text-primary font-medium">
          Paired Channels →
        </button>
      </div>

      <div className="grid grid-cols-2 gap-2 px-4 relative">
        <button
          onClick={() => setPicking((v) => !v)}
          disabled={busy || available.length === 0}
          className="flex items-center justify-center gap-1.5 py-2.5 rounded-lg border border-border bg-surface-elevated text-xs font-semibold hover:bg-surface-high transition disabled:opacity-50"
        >
          <PlusIcon className="w-4 h-4" />
          Add Channel
        </button>
        <button
          onClick={onUpdateTitles}
          disabled={busy}
          className="flex items-center justify-center gap-1.5 py-2.5 rounded-lg border border-border bg-surface-elevated text-xs font-semibold hover:bg-surface-high transition disabled:opacity-50"
        >
          <EditIcon className="w-3.5 h-3.5" />
          Update Titles
        </button>

        {picking && available.length > 0 && (
          <div className="absolute top-full left-4 mt-1 z-20 w-56 rounded-lg border border-border bg-surface-elevated shadow-xl p-1">
            {available.map((id) => {
              const meta = PLATFORM_META[id];
              return (
                <button
                  key={id}
                  onClick={() => {
                    onAddChannel(id);
                    setPicking(false);
                  }}
                  className="w-full flex items-center gap-2 px-3 py-2 rounded-md text-xs text-text-secondary hover:bg-surface-high hover:text-text-primary transition text-left"
                >
                  <span
                    className="w-2.5 h-2.5 rounded-full"
                    style={{ backgroundColor: `var(--color-${meta.colorVar})` }}
                  />
                  {meta.displayName}
                </button>
              );
            })}
          </div>
        )}
      </div>

      <div className="flex items-center justify-between px-4 mt-3 mb-2">
        <span className="text-xs text-text-tertiary">
          {activeCount} of {total} active
        </span>
      </div>

      <ul className="px-3 pb-3 flex-1 overflow-y-auto">
        {destinations.length === 0 ? (
          <li className="px-3 py-8 text-center text-xs text-text-tertiary">
            Sin canales aún. Pulsa <b className="text-text-secondary">Add Channel</b> para conectar tu primera plataforma.
          </li>
        ) : (
          destinations.map((d) => (
            <ChannelRow
              key={d.id}
              destination={d}
              onToggle={() => onToggle(d.id)}
              onRemove={() => onRemove(d.id)}
              busy={busy}
            />
          ))
        )}
      </ul>
    </div>
  );
}

function ChannelRow({
  destination,
  onToggle,
  onRemove,
  busy,
}: {
  destination: Dest;
  onToggle: () => void;
  onRemove: () => void;
  busy?: boolean;
}) {
  const meta = PLATFORM_META[destination.platformId];
  const color = `var(--color-${meta.colorVar})`;
  const status = destination.status;
  const handle = destination.channelHandle || meta.displayName;

  return (
    <li className="mb-1.5">
      <div className="flex items-center gap-3 px-2 py-2 rounded-lg hover:bg-surface-elevated transition group">
        <div className="relative shrink-0">
          <div
            className="w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold text-text-primary"
            style={{ backgroundColor: "var(--color-surface-high)" }}
          >
            {avatarInitial(handle)}
          </div>
          <div
            className="absolute -bottom-0.5 -right-0.5 w-4 h-4 rounded-full border-2 border-surface"
            style={{ backgroundColor: color }}
            title={meta.displayName}
          />
        </div>

        <div className="flex-1 min-w-0">
          <div className="text-xs font-semibold truncate text-text-primary">
            {handle}
          </div>
          <div className="text-[11px] text-text-tertiary truncate">
            {destination.streamTitle || meta.displayName}
          </div>
          {status?.kind === "offline" && (
            <div className="flex items-center gap-1.5 mt-0.5">
              <span className="w-1.5 h-1.5 rounded-full bg-text-tertiary" />
              <span className="text-[10px] text-text-tertiary">Offline</span>
            </div>
          )}
        </div>

        <button
          onClick={onRemove}
          disabled={busy}
          className="p-1 text-text-tertiary hover:text-bad opacity-0 group-hover:opacity-100 transition disabled:opacity-30"
          aria-label="Quitar canal"
          title="Quitar"
        >
          ✕
        </button>

        <button
          className="p-1 text-text-tertiary hover:text-text-primary"
          aria-label="Output mode"
          title="Output mode"
        >
          <MonitorIcon className="w-4 h-4" />
        </button>

        <Toggle value={destination.enabled} onChange={onToggle} accent={color} busy={busy} />
      </div>

      {status && status.kind !== "ok" && status.kind !== "offline" && (
        <StatusBanner status={status} />
      )}
    </li>
  );
}

function StatusBanner({ status }: { status: DestinationStatus }) {
  if (status.kind === "expired") {
    return (
      <div className="mt-1 mx-2 px-3 py-2 rounded-md bg-bad/10 border border-bad/40 flex items-center gap-2">
        <AlertIcon className="w-3.5 h-3.5 text-bad shrink-0" />
        <span className="text-[11px] text-text-secondary flex-1">
          Account access expired.{" "}
          <span className="text-text-primary font-semibold">Reconnect</span>
        </span>
      </div>
    );
  }
  if (status.kind === "pending_approval") {
    return (
      <div className="mt-1 mx-2 px-3 py-2 rounded-md bg-bad/10 border border-bad/40 flex items-center gap-2">
        <AlertIcon className="w-3.5 h-3.5 text-bad shrink-0" />
        <span className="text-[11px] text-text-secondary flex-1">
          {status.platformName} hasn&apos;t approved your account.{" "}
          <span className="text-text-primary font-semibold">Apply</span>
        </span>
      </div>
    );
  }
  return null;
}

function Toggle({
  value,
  onChange,
  accent,
  busy,
}: {
  value: boolean;
  onChange: () => void;
  accent: string;
  busy?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onChange}
      disabled={busy}
      aria-pressed={value}
      className="relative inline-flex h-5 w-9 items-center rounded-full transition shrink-0 disabled:opacity-50"
      style={{ backgroundColor: value ? accent : "var(--color-surface-high)" }}
    >
      <span
        className={`inline-block h-4 w-4 transform rounded-full bg-white transition ${
          value ? "translate-x-[18px]" : "translate-x-0.5"
        }`}
      />
    </button>
  );
}

function ChatTab() {
  return (
    <div className="flex-1 flex flex-col items-center justify-center text-text-tertiary px-6 py-12">
      <ChatIcon className="w-10 h-10 mb-3 opacity-50" />
      <p className="text-sm font-semibold text-text-secondary">
        Chat unificado próximamente
      </p>
      <p className="text-xs text-center mt-2 max-w-xs">
        Kick ya está conectado en la app móvil. Twitch IRC y YouTube Live Chat
        llegan cuando aterrice el backend.
      </p>
    </div>
  );
}
