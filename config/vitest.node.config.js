import { defineConfig } from 'vitest/config'

// Get benchmarkOptionsName from environment variable
const benchmarkOptionsName = process.env.BENCHMARK_OPTIONS_NAME || ''

export default defineConfig({
  test: {
    testTimeout: 600000,
    hookTimeout: 600000,
    include: ['benchmark/**/*.js'],
    environment: 'node',
    globals: false,
    // Pass benchmarkOptionsName to tests via env
    env: {
      BENCHMARK_OPTIONS_NAME: benchmarkOptionsName
    }
  }
})
