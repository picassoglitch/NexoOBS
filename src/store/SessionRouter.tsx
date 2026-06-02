import { useEffect } from "react";
import { router, useSegments } from "expo-router";
import { useSession } from "./session.store";

/**
 * Routes that count as "inside the authenticated app shell" — once the user
 * is `ready`, they can move freely between these without being snapped back
 * to their role home. Add new authenticated screens here.
 */
const APP_ROOTS: ReadonlySet<string> = new Set([
  "streamer",
  "operator",
  "destinations",
  "diagnostics",
  "settings",
]);

/**
 * Global route watcher. Mounted once inside SessionProvider in
 * app/_layout.tsx. Snaps the user to the screen that matches the current
 * session phase whenever they're on a route that doesn't belong there.
 *
 *   loggedOut → /auth/login    (unless already on /auth/*)
 *   needsRole → /lobby
 *   ready     → /streamer or /operator if user lands on /auth/* / /lobby / index;
 *                else leave them alone so they can navigate freely.
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
      // Only force a redirect when the user lands somewhere that isn't part
      // of the authenticated shell (auth/login after sign-in, the lobby
      // after picking a role, or the splash route). Inside the shell — incl.
      // /destinations, /diagnostics, etc. — leave navigation alone.
      const inAppShell = APP_ROOTS.has(root);
      if (!inAppShell) {
        const target = role === "operator" ? "/operator" : "/streamer";
        router.replace(target);
      }
    }
  }, [phase, role, segments]);

  return null;
}
