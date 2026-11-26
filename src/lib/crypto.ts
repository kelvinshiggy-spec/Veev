// Client-side encryption. The key is derived from Veev's passcode on her device
// and never leaves it. Nobody else (including whoever runs the server or database)
// can read encrypted data without the passcode.

const enc = new TextEncoder();
const dec = new TextDecoder();

export const b64 = (buf: ArrayBuffer | Uint8Array) => {
  const bytes = buf instanceof Uint8Array ? buf : new Uint8Array(buf);
  let s = "";
  for (let i = 0; i < bytes.length; i++) s += String.fromCharCode(bytes[i]);
  return btoa(s);
};
export const unb64 = (s: string) => Uint8Array.from(atob(s), (c) => c.charCodeAt(0));

export interface Sealed {
  v: 1;
  salt: string;
  iv: string;
  ct: string;
}

export async function deriveKey(passcode: string, salt: Uint8Array): Promise<CryptoKey> {
  const base = await crypto.subtle.importKey("raw", enc.encode(passcode), "PBKDF2", false, ["deriveKey"]);
  return crypto.subtle.deriveKey(
    { name: "PBKDF2", salt: salt as BufferSource, iterations: 310_000, hash: "SHA-256" },
    base,
    { name: "AES-GCM", length: 256 },
    false,
    ["encrypt", "decrypt"],
  );
}

export const newSalt = () => crypto.getRandomValues(new Uint8Array(16));

export async function seal(key: CryptoKey, salt: Uint8Array, data: string): Promise<Sealed> {
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const ct = await crypto.subtle.encrypt({ name: "AES-GCM", iv }, key, enc.encode(data));
  return { v: 1, salt: b64(salt), iv: b64(iv), ct: b64(ct) };
}

export async function unseal(key: CryptoKey, s: Sealed): Promise<string> {
  const pt = await crypto.subtle.decrypt(
    { name: "AES-GCM", iv: unb64(s.iv) as BufferSource },
    key,
    unb64(s.ct) as BufferSource,
  );
  return dec.decode(pt);
}
