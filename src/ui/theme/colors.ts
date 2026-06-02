/**
 * Cyberpunk dark palette shared across Streamer + Operator modes.
 *
 * Surface hierarchy: Background (page) < Surface (cards) < SurfaceElevated
 * (interactive cards) < SurfaceHigh (modal sheets / active selection).
 *
 * Accent reservations:
 *  - Primary (cyan)   — brand + neutral CTAs
 *  - Magenta          — LIVE indicator, danger CTAs
 *  - AccentGreen      — success / save / streaming healthy
 *  - AccentAmber      — warnings, permission-required gates
 *  - AccentRed        — errors, stop-stream
 *  - AccentBlue       — informational, USB device hooks
 *  - AccentPurple     — PC ingest / studio target
 */
export const BridgeColors = {
  Background: "#05050A",
  Surface: "#0F0F1A",
  SurfaceElevated: "#15152A",
  SurfaceHigh: "#1F1F33",

  Primary: "#00E5FF",
  PrimaryHover: "#38ECFF",
  PrimarySoft: "rgba(0, 229, 255, 0.25)",
  Magenta: "#FF2D7F",

  AccentGreen: "#00FFA3",
  AccentBlue: "#3DD5F3",
  AccentAmber: "#FFB020",
  AccentRed: "#FF4D6D",
  AccentPurple: "#B266FF",

  StatusGood: "#00FFA3",
  StatusWarn: "#FFB020",
  StatusBad: "#FF4D6D",
  StatusIdle: "#6F7580",

  TextPrimary: "#E8ECF1",
  TextSecondary: "#A0A6B0",
  TextTertiary: "#6F7580",

  Border: "#262640",
  BorderSoft: "rgba(255, 255, 255, 0.08)",
} as const;

/**
 * Monospace stack used for telemetry, badges, mode labels. Falls back to the
 * system mono so we don't ship a bundled font during Phase 0; swap to JetBrains
 * Mono or Space Grotesk Mono in Phase 1 polish if needed.
 */
export const Mono = {
  fontFamily: "monospace",
} as const;

export type Health = "good" | "warn" | "bad" | "idle";

export const healthColor: Record<Health, string> = {
  good: BridgeColors.StatusGood,
  warn: BridgeColors.StatusWarn,
  bad: BridgeColors.StatusBad,
  idle: BridgeColors.StatusIdle,
};
