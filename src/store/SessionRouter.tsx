import { useEffect } from "react";
import { router, useSegments } from "expo-router";
import { useSession } from "./session.store";

/**
 * Global watcher that keeps the active route in sync with the session phase.
 * Mounted once inside the SessionProvider in app/_layout.tsx.
 *
 * Why this exists: the previous design put the phase→route redirect inside
 * app/index.tsx only, which meant once the user navigated to /auth/login the
 * redirect logic was unmounted and a successful login wouldn't take them
 * forward. This watcher fires on every phase or route change, so the app
 * always lands on the right screen regardless of where the change came from
 * (login, profile pick, role pick, logout, session expiry).
 */
export function SessionRouter() {
  const { phase, role } = useSession();
  const segments = useSegments();

  useEffect(() => {
    if (phase === "loading") return;

    const root = segments[0] ?? "";
    const path = segments.join("/");

    if (phase === "loggedOut") {
      if (root !== "auth") router.replace("/auth/login");
      return;
    }
    if (phase === "needsProfile") {
      if (path !== "auth/profile-select") {
        router.replace("/auth/profile-select");
      }
      return;
    }
    if (phase === "needsRole") {
      if (root !== "lobby") router.replace("/lobby");
      return;
    }
    if (phase === "ready") {
      const target = role === "operator" ? "/operator" : "/streamer";
      if (root !== "streamer" && root !== "operator") {
        router.replace(target);
      }
    }
  }, [phase, role, segments]);

  return null;
}
