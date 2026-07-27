import { describe, it, expect } from 'vitest';
import { sanitizeTitleText, sanitizeBodyText } from '../src/sanitize.js';

describe('sanitizeTitleText', () => {
  it('clamps length', () => {
    const text = 'a'.repeat(300);
    const sanitized = sanitizeTitleText(text, 200);
    expect(sanitized.length).toBe(200);
    expect(sanitized.endsWith('…')).toBe(true);
  });

  it('neutralizes GitHub mentions', () => {
    const text = 'hello @someone and @team-name!';
    const sanitized = sanitizeTitleText(text, 200);
    expect(sanitized).toBe('hello `@`someone and `@`team-name!');
  });

  it('strips newlines and control chars', () => {
    const text = 'hello\n\tworld\x0B!';
    const sanitized = sanitizeTitleText(text, 200);
    expect(sanitized).toBe('hello world!');
  });
});

describe('sanitizeBodyText', () => {
  it('clamps length', () => {
    const text = 'a'.repeat(3000);
    const sanitized = sanitizeBodyText(text, 2000);
    expect(sanitized.length).toBe(2000);
    expect(sanitized.endsWith('…')).toBe(true);
  });

  it('neutralizes GitHub mentions', () => {
    const text = 'hello @someone and @team-name!';
    const sanitized = sanitizeBodyText(text, 2000);
    expect(sanitized).toBe('hello `@`someone and `@`team-name!');
  });

  it('collapses excessive newlines', () => {
    const text = 'hello\n\n\n\n\nworld';
    const sanitized = sanitizeBodyText(text, 2000);
    expect(sanitized).toBe('hello\n\nworld');
  });

  it('strips control chars but keeps newlines', () => {
    const text = 'hello\x0Bworld\n!';
    const sanitized = sanitizeBodyText(text, 2000);
    expect(sanitized).toBe('helloworld\n!');
  });
});
