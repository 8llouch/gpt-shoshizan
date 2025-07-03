import { fileURLToPath } from 'node:url'
import { mergeConfig, defineConfig, configDefaults } from 'vitest/config'
import viteConfig from './vite.config'

export default mergeConfig(
  viteConfig,
  defineConfig({
    test: {
      environment: 'jsdom',
      exclude: [
        ...configDefaults.exclude,
        'e2e/**',
        'playwright.config.ts',
        'e2e/utils/**',
        'src/main.ts',
        'src/i18n/**',
      ],
      root: fileURLToPath(new URL('./', import.meta.url)),
      coverage: {
        exclude: [
          // Default exclusions
          'node_modules/**',
          'dist/**',
          'build/**',
          'coverage/**',
          // Test files
          '**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}',
          '**/__tests__/**',
          '**/test/**',
          '**/tests/**',
          // E2E files
          'e2e/**',
          'playwright-report/**',
          'test-results/**',
          // Config files
          '*.config.{js,ts,mjs,cjs}',
          'vite.config.*',
          'vitest.config.*',
          'playwright.config.*',
          // Types
          '**/*.d.ts',
          // Entry points and setup files
          'src/main.ts',
          'src/assets/**',
          'src/router/index.ts',
          'src/i18n/index.ts',
        ],
      },
    },
  }),
)
