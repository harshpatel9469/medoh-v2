import crypto from "crypto";

export function generateSignedUrl(
  baseUrl: string,
  securityKey: string,
  filePath: string,
  expiresInSec = 600
): string {
  const expiration = Math.floor(Date.now() / 1000) + expiresInSec;
  const fullPath = filePath.startsWith("/") ? filePath : "/" + filePath;
  const hash = crypto
    .createHash("sha256")
    .update(securityKey + fullPath + expiration)
    .digest("hex");

  return `${baseUrl}${fullPath}?token=${hash}&expires=${expiration}`;
} 