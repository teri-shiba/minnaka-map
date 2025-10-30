import { fileURLToPath, URL } from 'node:url'
import react from '@vitejs/plugin-react'
import tsconfigPaths from 'vite-tsconfig-paths'
import { defineConfig } from 'vitest/config'

export default defineConfig({
  plugins: [react(), tsconfigPaths()],
  resolve: {
    alias: [
      { find: /^~\//, replacement: fileURLToPath(new URL('./src/', import.meta.url)) },
      { find: /^~$/, replacement: fileURLToPath(new URL('./src', import.meta.url)) },
    ],
  },
  test: {
    globals: true,
    coverage: {
      provider: 'v8',
      reportsDirectory: 'coverage',
      reporter: ['text', 'html'],
      include: ['src/**/*.{ts,tsx}'],
      exclude: [
        '**/__tests__/**',
        'src/**/*.d.ts',
        'src/instrumentation*.ts',
        'src/components/ui/**',
        'src/constants/**',
        'src/types/**',
        'src/data/**',
        'src/utils/cn.ts',
      ],
    },
    env: {
      NEXT_PUBLIC_API_BASE_URL: 'http://localhost',
      API_BASE_URL: 'http://localhost',
    },
    projects: [
      {
        extends: true,
        test: {
          name: 'unit',
          environment: 'jsdom',
          environmentOptions: {
            jsdom: { url: 'http://localhost/' },
          },
          include: ['__tests__/unit/**/*.{test,spec}.ts?(x)'],
        },
      },
      {
        extends: true,
        test: {
          name: 'integration-node',
          environment: 'node',
          setupFiles: ['__tests__/integration/setup/msw.server.ts'],
          include: ['__tests__/integration/services/**/*.{test,spec}.ts?(x)'],
        },
      },
      {
        extends: true,
        test: {
          name: 'integration-jsdom',
          environment: 'jsdom',
          setupFiles: ['__tests__/integration/setup/msw.server.ts'],
          include: ['__tests__/integration/components/**/*.{test,spec}.ts?(x)'],
        },
      },
    ],
  },
})
