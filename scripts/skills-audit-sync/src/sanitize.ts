export function sanitizeTitleText(text: string, maxLength = 200): string {
  let sanitized = text.replace(/[\r\n\t]+/g, ' ').replace(/[\x00-\x09\x0B-\x1F\x7F-\x9F]+/g, '');
  sanitized = sanitized.replace(/@([a-zA-Z0-9_-]+)/g, '`@`$1');
  if (sanitized.length > maxLength) {
    return sanitized.slice(0, Math.max(0, maxLength - 1)) + '…';
  }
  return sanitized;
}

export function sanitizeBodyText(text: string, maxLength = 2000): string {
  let sanitized = text.replace(/[\x00-\x09\x0B-\x1F\x7F-\x9F]+/g, '');
  sanitized = sanitized.replace(/\n{3,}/g, '\n\n');
  sanitized = sanitized.replace(/@([a-zA-Z0-9_-]+)/g, '`@`$1');
  if (sanitized.length > maxLength) {
    return sanitized.slice(0, Math.max(0, maxLength - 1)) + '…';
  }
  return sanitized;
}

