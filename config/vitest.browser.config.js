import { defineConfig } from 'vitest/config'

// Get CLI args from environment variables
const benchmarkOptionsName = process.env.BENCHMARK_OPTIONS_NAME || ''
const file = process.env.BENCHMARK_FILE || ''

export default defineConfig({
  test: {
    testTimeout: 600000,
    hookTimeout: 600000,
    include: file ? [`benchmark/${file}`] : ['benchmark/**/*.js'],
    browser: {
      enabled: true,
      provider: 'playwright',
      name: 'chromium',
      headless: true,
      providerOptions: {
        launch: {
          args: ['--disable-web-security', '--no-sandbox']
        }
      }
    },
    globals: false
  },
  define: {
    // Make benchmarkOptionsName available as window.benchmarkOptionsName in browser
    'window.benchmarkOptionsName': JSON.stringify(benchmarkOptionsName)
  },
  resolve: {
    alias: {
      // Redirect node import to browser import for plebbit-js
      '../node_modules/@plebbit/plebbit-js/dist/node/index.js': '../node_modules/@plebbit/plebbit-js/dist/browser/index.js'
    }
  }
})
