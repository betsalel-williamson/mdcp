import type { MdcpConfig } from '../config/schema.js';

export interface CompileHookContext {
  guideName: string;
  filename: string;
  body: string;
  config: MdcpConfig;
  outputBasename?: string;
  sourceFile: string;
}

export type CompileHook = (ctx: CompileHookContext) => string;

const builtinHooks = new Map<string, CompileHook>();

export function registerCompileHook(name: string, hook: CompileHook): void {
  builtinHooks.set(name, hook);
}

export function getCompileHook(name: string): CompileHook | undefined {
  return builtinHooks.get(name);
}

export function applyCompileHooks(
  body: string,
  ctx: Omit<CompileHookContext, 'body'>,
  hookNames: string[] | undefined,
): string {
  if (!hookNames?.length) return body;
  let out = body;
  for (const name of hookNames) {
    const hook = builtinHooks.get(name);
    if (hook) {
      out = hook({ ...ctx, body: out });
    }
  }
  return out;
}

/** No-op hook for tests and extension point verification. */
export const identityHook: CompileHook = (ctx) => ctx.body;

registerCompileHook('identity', identityHook);
