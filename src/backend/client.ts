import type {
  HealthSample,
  PlatformConnection,
  PlatformId,
  Profile,
  Session,
} from "./types";

/**
 * Single interface every screen depends on. The Phase-0 mock lives in
 * ./mock.ts; a real HTTP impl plugs in here later without screen changes.
 */
export interface BackendClient {
  // ---- Auth ---------------------------------------------------------------
  loginWithPassword(email: string, password: string): Promise<Session>;
  refreshSession(token: string): Promise<Session>;
  logout(): Promise<void>;

  // ---- Profiles -----------------------------------------------------------
  listProfiles(): Promise<Profile[]>;
  upsertProfile(profile: Profile): Promise<Profile>;

  // ---- Platform connections ----------------------------------------------
  listPlatformConnections(profileId: string): Promise<PlatformConnection[]>;
  upsertPlatformConnection(
    profileId: string,
    conn: PlatformConnection,
  ): Promise<PlatformConnection>;
  setPlatformEnabled(
    profileId: string,
    platformId: PlatformId,
    enabled: boolean,
  ): Promise<void>;

  // ---- Stream sessions + role coordination -------------------------------
  // (signatures land in commit 6 when permissions UI ships)

  // ---- Telemetry (operator → streamer) -----------------------------------
  reportHealth(sessionId: string, sample: HealthSample): Promise<void>;
}
