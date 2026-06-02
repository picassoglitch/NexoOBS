import { MockBackend } from "./mock";
import type { BackendClient } from "./client";

/** Phase-0 singleton. Swap to HttpBackend later. */
export const backend: BackendClient = new MockBackend();

export type { BackendClient } from "./client";
export type {
  HealthSample,
  PlatformConnection,
  PlatformId,
  Permissions,
  Profile,
  Role,
  Session,
} from "./types";
export { defaultPermissions } from "./types";
