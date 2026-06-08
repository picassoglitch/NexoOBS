"use client";

import { useState } from "react";
import { HomeIcon, ClipsIcon, ChevronDownIcon } from "./icons";

interface HeaderProps {
  title: string;
  isLive: boolean;
  recordEnabled: boolean;
  /** NexoClip connection ON/OFF — when on, streams flow to NexoClip for clips. */
  clipsEnabled?: boolean;
  /** Whether the connection switch can be toggled (full access only). */
  clipsAvailable?: boolean;
  onTitleChange: (next: string) => void;
  onRecordToggle: () => void;
  onToggleClips: () => void;
}

export function Header({
  title,
  isLive,
  recordEnabled,
  clipsEnabled,
  clipsAvailable = true,
  onTitleChange,
  onRecordToggle,
  onToggleClips,
}: HeaderProps) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(title);

  return (
    <header className="flex items-center gap-3 px-4 py-3 border-b border-border bg-bg sticky top-0 z-10">
      <button
        type="button"
        className="w-10 h-10 rounded-lg bg-surface border border-border flex items-center justify-center text-text-secondary hover:text-text-primary transition"
        aria-label="Home"
      >
        <HomeIcon className="w-5 h-5" />
      </button>

      <div className="flex-1 flex items-center gap-2 min-w-0">
        {editing ? (
          <input
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onBlur={() => {
              onTitleChange(draft.trim() || title);
              setEditing(false);
            }}
            onKeyDown={(e) => {
              if (e.key === "Enter") (e.target as HTMLInputElement).blur();
              if (e.key === "Escape") {
                setDraft(title);
                setEditing(false);
              }
            }}
            autoFocus
            className="flex-1 bg-surface border border-border rounded-md px-3 py-1.5 text-sm text-text-primary outline-none focus:border-accent"
          />
        ) : (
          <button
            type="button"
            onClick={() => {
              setDraft(title);
              setEditing(true);
            }}
            className="flex items-center gap-1.5 max-w-full text-left truncate hover:text-text-primary text-text-primary"
          >
            <span className="truncate text-sm font-medium">{title}</span>
            <ChevronDownIcon className="w-4 h-4 text-text-tertiary shrink-0" />
          </button>
        )}
      </div>

      <button
        type="button"
        className="px-3.5 py-1.5 text-xs font-semibold rounded-md bg-accent-soft text-accent border border-accent/40 hover:bg-accent/20 transition"
      >
        Upgrade
      </button>

      <div className="flex items-center gap-2 px-2">
        <button
          type="button"
          onClick={onRecordToggle}
          aria-pressed={recordEnabled}
          className={`relative inline-flex h-6 w-11 items-center rounded-full transition ${
            recordEnabled ? "bg-accent" : "bg-surface-high"
          }`}
        >
          <span
            className={`inline-block h-5 w-5 transform rounded-full bg-white transition ${
              recordEnabled ? "translate-x-5" : "translate-x-0.5"
            }`}
          />
        </button>
        <span className="text-xs font-medium text-text-secondary">Record</span>
      </div>

      {/* NexoClip connection switch — when ON, streams flow to NexoClip and
          clips are generated. Only full-access users can flip it on. */}
      <div
        className="flex items-center gap-2 px-2"
        title={
          clipsAvailable
            ? clipsEnabled
              ? "Conectado a NexoClip — los streams generan clips"
              : "Conectar con NexoClip para generar clips"
            : "Requiere Full Access"
        }
      >
        <ClipsIcon
          className={`w-4 h-4 ${clipsEnabled && clipsAvailable ? "text-accent" : "text-text-tertiary"}`}
        />
        <button
          type="button"
          onClick={onToggleClips}
          disabled={!clipsAvailable}
          aria-pressed={!!clipsEnabled}
          className={`relative inline-flex h-6 w-11 items-center rounded-full transition disabled:opacity-40 disabled:cursor-not-allowed ${
            clipsEnabled && clipsAvailable ? "bg-accent" : "bg-surface-high"
          }`}
        >
          <span
            className={`inline-block h-5 w-5 transform rounded-full bg-white transition ${
              clipsEnabled && clipsAvailable ? "translate-x-5" : "translate-x-0.5"
            }`}
          />
        </button>
        <span className="text-xs font-medium text-text-secondary hidden sm:inline">
          NexoClip
        </span>
      </div>

      {isLive && (
        <span className="ml-1 inline-flex items-center gap-1.5 px-2 py-1 rounded-md bg-bad/15 text-bad text-[10px] font-bold tracking-wider">
          <span className="w-1.5 h-1.5 rounded-full bg-bad animate-pulse" />
          LIVE
        </span>
      )}
    </header>
  );
}
