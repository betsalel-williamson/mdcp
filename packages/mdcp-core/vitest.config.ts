import { defineConfig } from 'vitest/config';

// Coverage instrumentation slows every call, so timing budgets scale up under it.
const timingScale = process.argv.includes('--coverage') ? '4' : '1';

export default defineConfig({
  test: {
    include: ['test/**/*.test.ts'],
    env: { MDCP_TIMING_SCALE: timingScale },
    coverage: {
      provider: 'v8',
      include: ['src/**/*.{ts,js}'],
      exclude: ['**/*.d.ts', '**/dist/**'],
      reporter: ['text', 'json-summary', 'html', 'lcov'],
      reportsDirectory: './coverage',
      reportOnFailure: true,
    },
  },
});
