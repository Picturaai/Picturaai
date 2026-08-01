import { defineConfig } from 'vitest/config'
import path from 'path'

export default defineConfig({
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './'),
    },
  },
  test: {
    environment: 'jsdom',
    // The db driver is mocked in tests, but getDb() still requires the variable.
    env: {
      DATABASE_URL: process.env.DATABASE_URL ?? 'postgresql://vitest:vitest@localhost:5432/vitest',
    },
    include: ['tests/**/*.test.ts', 'tests/**/*.test.tsx'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json-summary'],
      include: ['lib/**/*.ts', 'hooks/**/*.ts'],
    },
  },
})
