/**
 * Formats a Unix timestamp (in seconds) to a human-readable date string.
 * Example: September 11, 2026
 */
export function formatUnixDate(unixSeconds: number): string {
  const monthNames = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];
  const d = new Date(unixSeconds * 1000);
  return `${monthNames[d.getMonth()]} ${d.getDate()}, ${d.getFullYear()}`;
}
