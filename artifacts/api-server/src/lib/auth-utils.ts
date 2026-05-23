import crypto from "crypto";

const TOKEN_SECRET = process.env.TOKEN_SECRET || "agritrust_dev_secret_change_in_production";
const TOKEN_VERSION = "v1";

export function hashPassword(password: string): string {
  const salt = crypto.randomBytes(16).toString("hex");
  const hash = crypto.scryptSync(password, salt, 64).toString("hex");
  return `${salt}:${hash}`;
}

export function verifyPassword(password: string, stored: string): boolean {
  if (!stored || !stored.includes(":")) {
    const legacyHash = crypto.createHash("sha256").update(password + "agritrust_salt").digest("hex");
    return legacyHash === stored;
  }
  const [salt, hash] = stored.split(":");
  const candidate = crypto.scryptSync(password, salt, 64).toString("hex");
  return crypto.timingSafeEqual(Buffer.from(hash, "hex"), Buffer.from(candidate, "hex"));
}

const TOKEN_TTL_MS = 7 * 24 * 60 * 60 * 1000;

export function generateToken(userId: number): string {
  const ts = Date.now().toString(36);
  const payload = `${TOKEN_VERSION}.${userId}.${ts}`;
  const sig = crypto.createHmac("sha256", TOKEN_SECRET).update(payload).digest("base64url");
  return `${payload}.${sig}`;
}

export function verifyToken(token: string): number | null {
  if (!token) return null;
  const parts = token.split(".");
  if (parts.length !== 4) return null;
  const [version, userIdStr, ts, sig] = parts;
  if (version !== TOKEN_VERSION) return null;
  const issuedAt = parseInt(ts, 36);
  if (isNaN(issuedAt) || Date.now() - issuedAt > TOKEN_TTL_MS) return null;
  const payload = `${version}.${userIdStr}.${ts}`;
  const expectedSig = crypto.createHmac("sha256", TOKEN_SECRET).update(payload).digest("base64url");
  try {
    if (!crypto.timingSafeEqual(Buffer.from(sig, "base64url"), Buffer.from(expectedSig, "base64url"))) {
      return null;
    }
  } catch {
    return null;
  }
  const userId = parseInt(userIdStr, 10);
  return isNaN(userId) ? null : userId;
}

export function extractBearerToken(authHeader: string | undefined): string | null {
  if (!authHeader || !authHeader.startsWith("Bearer ")) return null;
  return authHeader.slice(7).trim() || null;
}
