/**
 * Base64url encode/decode that works in both Edge runtime (middleware) and
 * Node runtime (route handlers). Avoids `Buffer` (Node-only) and `node:crypto`
 * so the same helpers compose across runtimes.
 */

export function b64urlEncode(bytes: Uint8Array): string {
  let bin = "";
  for (const b of bytes) bin += String.fromCharCode(b);
  return btoa(bin).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

export function b64urlEncodeString(s: string): string {
  return b64urlEncode(new TextEncoder().encode(s));
}

export function b64urlDecode(s: string): Uint8Array<ArrayBuffer> {
  const pad = "=".repeat((-s.length) & 3);
  const b64 = (s + pad).replace(/-/g, "+").replace(/_/g, "/");
  const bin = atob(b64);
  // Alloc the backing ArrayBuffer explicitly — TS 5.7+ types
  // `new Uint8Array(n)` as `Uint8Array<ArrayBufferLike>`, which the
  // Web Crypto subtle.* methods reject (they want ArrayBuffer-backed).
  const buf = new ArrayBuffer(bin.length);
  const bytes = new Uint8Array(buf);
  for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
  return bytes;
}

export function b64urlDecodeString(s: string): string {
  return new TextDecoder().decode(b64urlDecode(s));
}
