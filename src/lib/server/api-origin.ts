/** URL del API Spring (solo servidor: Route Handlers, sin exponer secretos al bundle). */
export function getSentinellaApiOrigin(): string {
  const url = process.env.SENTINELLA_API_URL?.trim();
  if (!url) {
    return "http://localhost:8080";
  }
  return url.replace(/\/$/, "");
}
