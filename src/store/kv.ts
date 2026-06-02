/**
 * Tiny key-value abstraction so we can swap the storage backend per use case.
 *
 * Phase 0 uses AsyncStorage for everything — it ships in every Expo Go
 * binary so there's no native-binding version skew. Phase 1+ moves true
 * secrets (stream keys, OAuth refresh tokens) to expo-secure-store inside
 * the custom dev client, but session metadata stays on this surface.
 */
import AsyncStorage from "@react-native-async-storage/async-storage";

export interface KvStore {
  get(key: string): Promise<string | null>;
  set(key: string, value: string): Promise<void>;
  remove(key: string): Promise<void>;
}

class AsyncStorageKv implements KvStore {
  async get(key: string): Promise<string | null> {
    return AsyncStorage.getItem(key);
  }
  async set(key: string, value: string): Promise<void> {
    await AsyncStorage.setItem(key, value);
  }
  async remove(key: string): Promise<void> {
    await AsyncStorage.removeItem(key);
  }
}

/** Default store for non-secret session data. */
export const kv: KvStore = new AsyncStorageKv();

/**
 * Secret store. Phase 0 = same AsyncStorage instance (mock data only — no
 * real secrets in Phase 0). Phase 1 swaps this to an expo-secure-store
 * wrapper once we're inside the dev client.
 */
export const secrets: KvStore = new AsyncStorageKv();
