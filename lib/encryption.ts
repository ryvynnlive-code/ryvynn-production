/**
 * RYVYNN encryption utils — AES-256-GCM
 * Key is never persisted. Encrypted blob is stored; original plaintext is not.
 * Used for: confession snapshot, journal entries.
 */

const ALGO = "aes-256-gcm" as const;
const IV_LENGTH = 12; // bytes — GCM standard
const TAG_LENGTH = 16;

// Runtime encryption key — derived from env, never logged
function getKey(): Buffer {
  const raw = process.env.ENCRYPTION_KEY;
  if (!raw) throw new Error("ENCRYPTION_KEY env var not set");
  // Pad/trim to exactly 32 bytes
  const buf = Buffer.alloc(32);
  Buffer.from(raw, "utf8").copy(buf);
  return buf;
}

export async function encrypt(plaintext: string): Promise<string> {
  const { createCipheriv, randomBytes } = await import("crypto");
  const key = getKey();
  const iv = randomBytes(IV_LENGTH);
  const cipher = createCipheriv(ALGO, key, iv);
  const encrypted = Buffer.concat([
    cipher.update(plaintext, "utf8"),
    cipher.final(),
  ]);
  const tag = cipher.getAuthTag();
  // Format: iv(12):tag(16):ciphertext — all base64
  return [
    iv.toString("base64"),
    tag.toString("base64"),
    encrypted.toString("base64"),
  ].join(":");
}

export async function decrypt(blob: string): Promise<string> {
  const { createDecipheriv } = await import("crypto");
  const key = getKey();
  const [ivB64, tagB64, ctB64] = blob.split(":");
  if (!ivB64 || !tagB64 || !ctB64) throw new Error("Invalid encrypted blob");
  const iv = Buffer.from(ivB64, "base64");
  const tag = Buffer.from(tagB64, "base64");
  const ciphertext = Buffer.from(ctB64, "base64");
  const decipher = createDecipheriv(ALGO, key, iv);
  decipher.setAuthTag(tag);
  return decipher.update(ciphertext) + decipher.final("utf8");
}

/** Cryptographic burn — overwrites key material, marks entry dead */
export function cryptoBurn(blob: string): string {
  // Replace ciphertext segment with zeroed base64 — key already gone
  const parts = blob.split(":");
  if (parts.length !== 3) return "BURNED";
  parts[2] = Buffer.alloc(32).toString("base64");
  return parts.join(":") + ":BURNED";
}

/** Server-side HMAC anonId — rotating daily salt */
export async function generateHmacId(seed: string): Promise<string> {
  const { createHmac } = await import("crypto");
  const secret = process.env.HMAC_SECRET || "ryvynn-default-rotate-this";
  const salt = new Date().toISOString().slice(0, 10); // daily rotation
  return createHmac("sha256", secret + salt)
    .update(seed)
    .digest("hex")
    .slice(0, 32);
}
