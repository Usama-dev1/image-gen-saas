import geoip from "geoip-lite";

/**
 * Derives a human-readable location string (City, Country) from an IP address.
 */
export function getLocationFromIP(ipAddress?: string | null): string {
  if (!ipAddress) return "Unknown";
  
  const geo = geoip.lookup(ipAddress);
  return geo ? `${geo.city}, ${geo.country}` : "Unknown";
}
