import {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import * as SecureStore from "expo-secure-store";
import { backend } from "@/backend";
import type { Profile, Role, Session } from "@/backend";

const SESSION_KEY = "nexo.session.v1";
const PROFILE_KEY = "nexo.activeProfileId.v1";
const ROLE_KEY = "nexo.activeRole.v1";

export type SessionPhase =
  | "loading" // hydrating from secure-store
  | "loggedOut" // no session
  | "needsProfile" // session OK, no profile selected
  | "needsRole" // profile picked, no role yet
  | "ready"; // everything resolved → role + profile + session

export interface SessionState {
  phase: SessionPhase;
  session: Session | null;
  profiles: Profile[];
  profile: Profile | null;
  role: Role | null;
  error: string | null;
}

interface SessionActions {
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  refreshProfiles: () => Promise<void>;
  selectProfile: (id: string) => Promise<void>;
  selectRole: (role: Role) => Promise<void>;
  /** Drops the role choice but keeps the profile (returns to the lobby). */
  clearRole: () => Promise<void>;
}

const Ctx = createContext<(SessionState & SessionActions) | null>(null);

export function SessionProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<SessionState>({
    phase: "loading",
    session: null,
    profiles: [],
    profile: null,
    role: null,
    error: null,
  });
  const mounted = useRef(true);

  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
    };
  }, []);

  const safeSet = useCallback((patch: Partial<SessionState>) => {
    if (!mounted.current) return;
    setState((prev) => ({ ...prev, ...patch }));
  }, []);

  // Initial hydrate ---------------------------------------------------------
  useEffect(() => {
    (async () => {
      try {
        const stored = await SecureStore.getItemAsync(SESSION_KEY);
        if (!stored) {
          safeSet({ phase: "loggedOut" });
          return;
        }
        const parsed: Session = JSON.parse(stored);
        if (parsed.expiresAt < Date.now()) {
          await SecureStore.deleteItemAsync(SESSION_KEY);
          safeSet({ phase: "loggedOut" });
          return;
        }
        const session = await backend
          .refreshSession(parsed.token)
          .catch(() => null);
        if (!session) {
          await SecureStore.deleteItemAsync(SESSION_KEY);
          safeSet({ phase: "loggedOut" });
          return;
        }
        await SecureStore.setItemAsync(SESSION_KEY, JSON.stringify(session));

        const profiles = await backend.listProfiles();
        const profileId = await SecureStore.getItemAsync(PROFILE_KEY);
        const profile = profileId
          ? (profiles.find((p) => p.id === profileId) ?? null)
          : null;
        const roleStr = await SecureStore.getItemAsync(ROLE_KEY);
        const role: Role | null =
          roleStr === "streamer" || roleStr === "operator" ? roleStr : null;

        let phase: SessionPhase = "needsProfile";
        if (profile) phase = role ? "ready" : "needsRole";

        safeSet({ session, profiles, profile, role, phase });
      } catch (err) {
        safeSet({
          phase: "loggedOut",
          error: err instanceof Error ? err.message : "hydrate failed",
        });
      }
    })();
  }, [safeSet]);

  // Actions -----------------------------------------------------------------
  const login = useCallback<SessionActions["login"]>(
    async (email, password) => {
      safeSet({ error: null });
      const session = await backend.loginWithPassword(email, password);
      await SecureStore.setItemAsync(SESSION_KEY, JSON.stringify(session));
      const profiles = await backend.listProfiles();
      safeSet({
        session,
        profiles,
        profile: null,
        role: null,
        phase: "needsProfile",
      });
    },
    [safeSet],
  );

  const logout = useCallback<SessionActions["logout"]>(async () => {
    await backend.logout().catch(() => {});
    await Promise.all([
      SecureStore.deleteItemAsync(SESSION_KEY),
      SecureStore.deleteItemAsync(PROFILE_KEY),
      SecureStore.deleteItemAsync(ROLE_KEY),
    ]);
    safeSet({
      session: null,
      profile: null,
      role: null,
      profiles: [],
      phase: "loggedOut",
    });
  }, [safeSet]);

  const refreshProfiles = useCallback<
    SessionActions["refreshProfiles"]
  >(async () => {
    if (!state.session) return;
    const profiles = await backend.listProfiles();
    safeSet({ profiles });
  }, [safeSet, state.session]);

  const selectProfile = useCallback<SessionActions["selectProfile"]>(
    async (id) => {
      const profile = state.profiles.find((p) => p.id === id) ?? null;
      if (!profile) return;
      await SecureStore.setItemAsync(PROFILE_KEY, id);
      safeSet({
        profile,
        // Pre-fill the role from the profile's lastRole; user confirms in lobby.
        role: null,
        phase: "needsRole",
      });
    },
    [safeSet, state.profiles],
  );

  const selectRole = useCallback<SessionActions["selectRole"]>(
    async (role) => {
      await SecureStore.setItemAsync(ROLE_KEY, role);
      safeSet({ role, phase: "ready" });
    },
    [safeSet],
  );

  const clearRole = useCallback<SessionActions["clearRole"]>(async () => {
    await SecureStore.deleteItemAsync(ROLE_KEY);
    safeSet({ role: null, phase: "needsRole" });
  }, [safeSet]);

  const value = useMemo(
    () => ({
      ...state,
      login,
      logout,
      refreshProfiles,
      selectProfile,
      selectRole,
      clearRole,
    }),
    [state, login, logout, refreshProfiles, selectProfile, selectRole, clearRole],
  );

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useSession() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useSession must be used inside SessionProvider");
  return ctx;
}
