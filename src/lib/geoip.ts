/**
 * Derives a human-readable location string (City, Country) from an IP address.
 * Uses dynamic require to avoid crashing serverless functions where geoip-lite
 * binary data files may not be available.
 */
export function getLocationFromIP(ipAddress?: string | null): string {
  if (!ipAddress) return "Unknown";

  try {
    const geoip = require("geoip-lite");
    const geo = geoip.lookup(ipAddress);
    return geo ? `${geo.city}, ${geo.country}` : "Unknown";
  } catch {
    return "Unknown";
  }
}
