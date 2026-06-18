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

/** Parse `mdcp.v{version}[--draft].llms.txt`; returns normalized four-part version or null. */
export function parseLlmsIndexFilename(filename: string): string | null {
  const match = /^mdcp\.v([\d.]+)(?:--draft)?\.llms\.txt$/i.exec(filename);
  if (!match) return null;
  return expandProtocolVersion(match[1]!);
}

/** Map four-part protocol version to npm release tag (e.g. `0.4.0.0` → `v0.4.0`). */
export function protocolVersionToReleaseRef(protocolVersion: string): string {
  const parts = expandProtocolVersion(protocolVersion).split('.');
  return `v${parts.slice(0, 3).join('.')}`;
}

/** True when filename uses the in-progress `--draft` suffix (not yet adopted as stable). */
export function isLlmsIndexDraftFilename(filename: string): boolean {
  return /^mdcp\.v[\d.]+--draft\.llms\.txt$/i.test(filename);
}
