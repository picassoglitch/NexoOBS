import type {
  HealthSample,
  NexoSession,
  PlatformConnection,
  PlatformId,
} from "./types";

/**
 * Backend contract for the NexoOBS engine. Phase 0 implementation talks to
 * the same Supabase project as Nexo-AI World + NexoClip (`SupabaseBackend`),
 * with a mock fallback (`MockBackend`) for when env vars aren't configured
 * or for offline UI dev.
 */
export interface BackendClient {
  // ---- Auth (Supabase-backed) --------------------------------------------
  /** Email/password sign-in. Returns the joined NexoSession on success. */
  signInWithPassword(email: string, password: string): Promise<NexoSession>;
  /** Current session if one's already cached/refreshable; null otherwise. */
  getCurrentSession(): Promise<NexoSession | null>;
  signOut(): Promise<void>;
  /** Subscribe to auth state changes (sign-in / sign-out / token refresh). */
  onAuthChange(handler: (session: NexoSession | null) => void): () => void;

  // ---- Platform connections (Phase 0: read-only mock) --------------------
  listPlatformConnections(userId: string): Promise<PlatformConnection[]>;
  upsertPlatformConnection(
    userId: string,
    conn: PlatformConnection,
  ): Promise<PlatformConnection>;
  setPlatformEnabled(
    userId: string,
    platformId: PlatformId,
    enabled: boolean,
  ): Promise<void>;

  // ---- Telemetry ----------------------------------------------------------
  reportHealth(sessionId: string, sample: HealthSample): Promise<void>;
}
