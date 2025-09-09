/// <reference types="vitest" />
import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.ts'],
    css: true,
    exclude: [
      '**/node_modules/**',
      '**/dist/**',
      '**/e2e/**',
      '**/.{idea,git,cache,output,temp}/**',
      '**/{karma,rollup,webpack,vite,vitest,jest,ava,babel,nyc,cypress,tsup,build}.config.*'
    ],
    // Configure test environment for Next.js 15 + React 19
    server: {
      deps: {
        inline: ['@trpc/server', '@trpc/client', '@trpc/react-query'],
      },
    },
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  // Exclude node_modules and next.js build outputs
  testPathIgnorePatterns: [
    '/node_modules/',
    '/.next/',
    '/out/',
    '/e2e/',
    '**/e2e/**',
  ],
  // Include test files
  testMatch: [
    '**/__tests__/**/*.(js|jsx|ts|tsx)',
    '**/*.(test|spec).(js|jsx|ts|tsx)',
  ],
  // Exclude e2e tests and other directories
  exclude: [
    'e2e/**',
    '**/e2e/**',
    'node_modules/**',
    'dist/**',
    'build/**',
    '.next/**',
  ],
})
