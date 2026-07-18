import { readFileSync } from 'node:fs';
import { parse as parseYaml } from 'yaml';
import type { AcceptedLog } from './types.js';

function parseAcceptedLog(doc: unknown): AcceptedLog {
  if (doc == null || typeof doc !== 'object') {
    throw new Error('Accepted log must be a YAML mapping');
  }

  const record = doc as Record<string, unknown>;
  if (!Array.isArray(record.accepted)) {
    throw new Error('Accepted log must include an accepted array');
  }

  if (typeof record.version !== 'number') {
    throw new Error('Accepted log must include a numeric version');
  }

  return {
    version: record.version,
    accepted: record.accepted as AcceptedLog['accepted'],
  };
}

export function loadAcceptedFingerprints(yamlContent: string): Set<string> {
  const doc = parseAcceptedLog(parseYaml(yamlContent));
  const fingerprints = doc.accepted.map((entry) => {
    if (entry == null || typeof entry !== 'object' || typeof entry.fingerprint !== 'string') {
      throw new Error('Each accepted entry must include a fingerprint string');
    }
    return entry.fingerprint;
  });

  return new Set(fingerprints);
}

export function loadAcceptedFingerprintsFromFile(path: string): Set<string> {
  return loadAcceptedFingerprints(readFileSync(path, 'utf8'));
}
