import type { BackendClient } from "./client";
import type {
  HealthSample,
  PlatformConnection,
  PlatformId,
  Profile,
  Session,
} from "./types";

const THIRTY_DAYS = 30 * 24 * 60 * 60 * 1000;

const seedProfiles: Profile[] = [
  {
    id: "profile_aldo",
    name: "Aldo",
    handle: "@aldo",
    avatarUrl: null,
    lastRole: "streamer",
    defaultDestinations: ["kick", "youtube"],
  },
  {
    id: "profile_ops",
    name: "Operator",
    handle: "@ops",
    avatarUrl: null,
    lastRole: "operator",
    defaultDestinations: [],
  },
];

const seedConnections: Record<string, PlatformConnection[]> = {
  profile_aldo: [
    {
      platformId: "kick",
      handle: "aldo",
      hasAuth: false,
      connectedAt: Date.now() - 86_400_000,
    },
  ],
  profile_ops: [],
};

/**
 * In-memory backend. Resets on every app reload. Phase 0 only — swap with
 * a real HTTP impl when the Nexo backend lands.
 */
export class MockBackend implements BackendClient {
  private profiles = seedProfiles.map((p) => ({ ...p }));
  private connections: Record<string, PlatformConnection[]> = JSON.parse(
    JSON.stringify(seedConnections),
  );
  private currentSession: Session | null = null;

  async loginWithPassword(email: string, _password: string): Promise<Session> {
    await delay(300);
    const session: Session = {
      token: `mock_${Math.random().toString(36).slice(2)}_${Date.now()}`,
      userId: "user_mock",
      email: email.trim() || "demo@nexo.ai",
      displayName: email.split("@")[0] || "Demo",
      expiresAt: Date.now() + THIRTY_DAYS,
    };
    this.currentSession = session;
    return session;
  }

  async refreshSession(token: string): Promise<Session> {
    await delay(100);
    if (!this.currentSession || this.currentSession.token !== token) {
      throw new Error("session expired");
    }
    const refreshed: Session = {
      ...this.currentSession,
      expiresAt: Date.now() + THIRTY_DAYS,
    };
    this.currentSession = refreshed;
    return refreshed;
  }

  async logout(): Promise<void> {
    await delay(50);
    this.currentSession = null;
  }

  async listProfiles(): Promise<Profile[]> {
    await delay(150);
    return [...this.profiles];
  }

  async upsertProfile(profile: Profile): Promise<Profile> {
    await delay(120);
    const idx = this.profiles.findIndex((p) => p.id === profile.id);
    if (idx >= 0) this.profiles[idx] = profile;
    else this.profiles.push(profile);
    return profile;
  }

  async listPlatformConnections(
    profileId: string,
  ): Promise<PlatformConnection[]> {
    await delay(80);
    return [...(this.connections[profileId] ?? [])];
  }

  async upsertPlatformConnection(
    profileId: string,
    conn: PlatformConnection,
  ): Promise<PlatformConnection> {
    await delay(120);
    const list = this.connections[profileId] ?? [];
    const idx = list.findIndex((c) => c.platformId === conn.platformId);
    if (idx >= 0) list[idx] = conn;
    else list.push(conn);
    this.connections[profileId] = list;
    return conn;
  }

  async setPlatformEnabled(
    _profileId: string,
    _platformId: PlatformId,
    _enabled: boolean,
  ): Promise<void> {
    await delay(40);
    // No-op in Phase 0; Phase 1 lights this up when destinations UI lands.
  }

  async reportHealth(_sessionId: string, _sample: HealthSample): Promise<void> {
    // No-op in Phase 0; Phase 1 wires the real telemetry channel.
  }
}

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
