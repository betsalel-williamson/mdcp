/** Expand abbreviated protocol version to four parts (e.g. `1` → `1.0.0.0`). */
export function expandProtocolVersion(abbrev: string): string {
  const parts = abbrev.split('.').filter((p) => p.length > 0);
  while (parts.length < 4) {
    parts.push('0');
  }
  return parts.slice(0, 4).join('.');
}

/** Drop trailing `.0` segments for filenames (e.g. `1.0.0.0` → `1`). */
export function abbreviateProtocolVersion(version: string): string {
  const parts = version.split('.');
  while (parts.length > 1 && parts[parts.length - 1] === '0') {
    parts.pop();
  }
  return parts.join('.');
}

/** Parse `mdcp.v{version}.llms.txt` filename; returns normalized four-part version or null. */
export function parseLlmsIndexFilename(filename: string): string | null {
  const match = /^mdcp\.v([\d.]+)\.llms\.txt$/i.exec(filename);
  if (!match) return null;
  return expandProtocolVersion(match[1]!);
}
