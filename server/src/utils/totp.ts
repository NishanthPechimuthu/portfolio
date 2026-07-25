import crypto from "crypto";

/**
 * Verify a TOTP code using RFC 6238 HMAC-SHA1.
 * Accepts codes from -1/0/+1 time windows to handle clock drift.
 */
export function verifyTOTP(secret: string, token: string): boolean {
  try {
    const cleanToken = token.trim().replace(/\s/g, "");
    if (cleanToken.length !== 6 || !/^\d{6}$/.test(cleanToken)) return false;

    const base32chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ234567";
    const cleanSecret = secret.toUpperCase().replace(/[=\s]/g, "");

    let bits = "";
    for (let j = 0; j < cleanSecret.length; j++) {
      const val = base32chars.indexOf(cleanSecret.charAt(j));
      if (val >= 0) bits += val.toString(2).padStart(5, "0");
    }
    const bytes = new Uint8Array(Math.floor(bits.length / 8));
    for (let j = 0; j < bytes.length; j++) {
      bytes[j] = parseInt(bits.substring(j * 8, j * 8 + 8), 2);
    }

    const period = 30;
    const now = Math.floor(Date.now() / 1000);

    for (let i = -1; i <= 1; i++) {
      const timeStep = Math.floor((now + i * period) / period);
      const buffer = Buffer.alloc(8);
      buffer.writeBigInt64BE(BigInt(timeStep), 0);

      const hmac = crypto.createHmac("sha1", Buffer.from(bytes));
      hmac.update(buffer);
      const hmacResult = hmac.digest();
      const offset = hmacResult[hmacResult.length - 1] & 0xf;
      const code =
        ((hmacResult[offset] & 0x7f) << 24) |
        ((hmacResult[offset + 1] & 0xff) << 16) |
        ((hmacResult[offset + 2] & 0xff) << 8) |
        (hmacResult[offset + 3] & 0xff);
      const otp = (code % 1000000).toString().padStart(6, "0");
      if (otp === cleanToken) return true;
    }
  } catch (e) {
    console.error("TOTP verification error:", e);
  }
  return false;
}
