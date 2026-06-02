import { useEffect } from "react";
import { router, useSegments } from "expo-router";
import { useSession } from "./session.store";

/**
 * Global route watcher. Mounted once inside SessionProvider in
 * app/_layout.tsx. Keeps the active route in sync with the session phase:
 *
 *   loggedOut → /auth/login
 *   needsRole → /lobby
 *   ready     → /streamer  or  /operator  (based on chosen role)
 */
export function SessionRouter() {
  const { phase, role } = useSession();
  const segments = useSegments();

  useEffect(() => {
    if (phase === "loading") return;
    const root = segments[0] ?? "";

    if (phase === "loggedOut") {
      if (root !== "auth") router.replace("/auth/login");
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
