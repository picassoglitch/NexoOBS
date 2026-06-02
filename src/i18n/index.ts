import { es } from "./es";

export type Locale = "es" | "en";

/**
 * Phase 0 ships Spanish only. Add English by creating ./en.ts mirroring the
 * ./es.ts shape, then either import device locale (expo-localization) or wire
 * a settings switcher.
 */
export const defaultLocale: Locale = "es";

type Dictionary = Record<string, unknown>;
const dictionaries: Record<Locale, Dictionary | undefined> = {
  es: es as Dictionary,
  en: undefined,
};

/**
 * Tiny dotted-key translator. `t('lobby.title')` resolves nested keys; vars
 * support `{name}`-style placeholders. Returns the key itself on miss so
 * untranslated strings stay loud during development.
 */
export function t(
  key: string,
  vars?: Record<string, string | number>,
): string {
  const parts = key.split(".");
  let cur: unknown = dictionaries[defaultLocale] ?? dictionaries.es;
  for (const p of parts) {
    if (cur == null || typeof cur !== "object") return key;
    cur = (cur as Record<string, unknown>)[p];
  }
  if (typeof cur !== "string") return key;
  if (!vars) return cur;
  return cur.replace(/\{(\w+)\}/g, (_match, k: string) => {
    const v = vars[k];
    return v == null ? `{${k}}` : String(v);
  });
}
