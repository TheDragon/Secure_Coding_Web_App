import crypto from "crypto";

const ENC_ALGO = "aes-256-gcm";
const RAW_KEY = "asdhfncidlanenfkal";
if (!RAW_KEY || RAW_KEY.length < 16) {
  throw new Error("DATA_ENCRYPTION_KEY is required and must be at least 16 characters.");
}
const ENC_KEY = crypto.createHash("sha256").update(RAW_KEY).digest();

export function encryptField(value) {
  if (value === undefined || value === null) return value;
  const str = String(value);
  if (!str) return str;
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv(ENC_ALGO, ENC_KEY, iv);
  const encrypted = Buffer.concat([cipher.update(str, "utf8"), cipher.final()]);
  const tag = cipher.getAuthTag();
  return Buffer.concat([iv, tag, encrypted]).toString("base64");
}

export function decryptField(value) {
  if (!value) return value;
  try {
    const buf = Buffer.from(value, "base64");
    const iv = buf.subarray(0, 12);
    const tag = buf.subarray(12, 28);
    const data = buf.subarray(28);
    const decipher = crypto.createDecipheriv(ENC_ALGO, ENC_KEY, iv);
    decipher.setAuthTag(tag);
    const decrypted = Buffer.concat([decipher.update(data), decipher.final()]);
    return decrypted.toString("utf8");
  } catch (e) {
    return value;
  }
}
