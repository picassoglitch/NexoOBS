"use client";

import { useState } from "react";
import {
  avatarInitial,
  DestinationConfig,
  DestinationStatus,
  PLATFORM_META,
} from "@/lib/destinations";
import {
  AlertIcon,
  BroadcastIcon,
  ChatIcon,
  EditIcon,
  MonitorIcon,
  PlusIcon,
} from "./icons";

interface ChannelsPanelProps {
  destinations: DestinationConfig[];
  onToggle: (index: number) => void;
  onAddChannel: () => void;
  onUpdateTitles: () => void;
  onReconnect: (index: number) => void;
  onApply: (index: number) => void;
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
          onReconnect={props.onReconnect}
          onApply={props.onApply}
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

function ChannelsTab(
  props: Omit<ChannelsPanelProps, "destinations"> & {
    activeCount: number;
    total: number;
    destinations: DestinationConfig[];
  },
) {
  return (
    <div className="flex flex-col flex-1">
      <div className="flex items-center justify-between px-4 pt-4 pb-2">
        <h3 className="text-sm font-bold">Your Channels</h3>
        <button className="text-xs text-text-secondary hover:text-text-primary font-medium">
          Paired Channels →
        </button>
      </div>

      <div className="grid grid-cols-2 gap-2 px-4">
        <button
          onClick={props.onAddChannel}
          className="flex items-center justify-center gap-1.5 py-2.5 rounded-lg border border-border bg-surface-elevated text-xs font-semibold hover:bg-surface-high transition"
        >
          <PlusIcon className="w-4 h-4" />
          Add Channel
        </button>
        <button
          onClick={props.onUpdateTitles}
          className="flex items-center justify-center gap-1.5 py-2.5 rounded-lg border border-border bg-surface-elevated text-xs font-semibold hover:bg-surface-high transition"
        >
          <EditIcon className="w-3.5 h-3.5" />
          Update Titles
        </button>
      </div>

      <div className="flex items-center justify-between px-4 mt-3 mb-2">
        <span className="text-xs text-text-tertiary">
          {props.activeCount} of {props.total} active{" "}
          <button className="text-accent hover:underline ml-1">Get More</button>
        </span>
        <span className="text-[10px] text-text-tertiary">
          Toggle all{" "}
          <button className="hover:text-text-primary font-bold">OFF</button>
          {" / "}
          <button className="hover:text-text-primary font-bold">ON</button>
        </span>
      </div>

      <ul className="px-3 pb-3 flex-1 overflow-y-auto">
        {props.destinations.map((d, i) => (
          <ChannelRow
            key={`${d.platformId}-${d.channelHandle}-${i}`}
            destination={d}
            onToggle={() => props.onToggle(i)}
            onReconnect={() => props.onReconnect(i)}
            onApply={() => props.onApply(i)}
          />
        ))}
      </ul>
    </div>
  );
}

function ChannelRow({
  destination,
  onToggle,
  onReconnect,
  onApply,
}: {
  destination: DestinationConfig;
  onToggle: () => void;
  onReconnect: () => void;
  onApply: () => void;
}) {
  const meta = PLATFORM_META[destination.platformId];
  const color = `var(--color-${meta.colorVar})`;
  const status = destination.status;
  const isMuted = status?.kind === "pending_approval" || status?.kind === "expired";

  return (
    <li className="mb-1.5">
      <div className="flex items-center gap-3 px-2 py-2 rounded-lg hover:bg-surface-elevated transition">
        <div className="relative shrink-0">
          <div
            className="w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold text-text-primary"
            style={{ backgroundColor: "var(--color-surface-high)" }}
          >
            {avatarInitial(destination.channelHandle)}
          </div>
          <div
            className="absolute -bottom-0.5 -right-0.5 w-4 h-4 rounded-full border-2 border-surface"
            style={{ backgroundColor: color }}
            title={meta.displayName}
          />
        </div>

        <div className="flex-1 min-w-0">
          <div className={`text-xs font-semibold truncate ${isMuted ? "text-text-tertiary" : "text-text-primary"}`}>
            {destination.channelHandle}
          </div>
          <div className="text-[11px] text-text-tertiary truncate">
            {destination.streamTitle}
          </div>
          {status?.kind === "offline" && (
            <div className="flex items-center gap-1.5 mt-0.5">
              <span className="w-1.5 h-1.5 rounded-full bg-text-tertiary" />
              <span className="text-[10px] text-text-tertiary">Offline</span>
            </div>
          )}
        </div>

        <button
          className="p-1 text-text-tertiary hover:text-text-primary"
          aria-label="Output mode"
          title="Output mode"
        >
          <MonitorIcon className="w-4 h-4" />
        </button>

        <button className="text-[11px] text-text-secondary hover:text-text-primary font-medium px-1">
          Edit
        </button>

        <Toggle value={destination.enabled} onChange={onToggle} accent={color} />
      </div>

      {status && status.kind !== "ok" && status.kind !== "offline" && (
        <StatusBanner status={status} onReconnect={onReconnect} onApply={onApply} />
      )}
    </li>
  );
}

function StatusBanner({
  status,
  onReconnect,
  onApply,
}: {
  status: DestinationStatus;
  onReconnect: () => void;
  onApply: () => void;
}) {
  if (status.kind === "expired") {
    return (
      <div className="mt-1 mx-2 px-3 py-2 rounded-md bg-bad/10 border border-bad/40 flex items-center gap-2">
        <AlertIcon className="w-3.5 h-3.5 text-bad shrink-0" />
        <span className="text-[11px] text-text-secondary flex-1">
          Account access expired.{" "}
          <button onClick={onReconnect} className="text-text-primary font-semibold underline hover:text-bad">
            Reconnect
          </button>
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
          <button onClick={onApply} className="text-text-primary font-semibold underline hover:text-bad">
            Apply
          </button>
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
}: {
  value: boolean;
  onChange: () => void;
  accent: string;
}) {
  return (
    <button
      type="button"
      onClick={onChange}
      aria-pressed={value}
      className="relative inline-flex h-5 w-9 items-center rounded-full transition shrink-0"
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
