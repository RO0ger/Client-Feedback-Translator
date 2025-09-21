/// <reference types="vitest" />
import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.tsx'],
    css: true,
    exclude: [
      '**/node_modules/**',
      '**/dist/**',
      '**/e2e/**',
      '**/.{idea,git,cache,output,temp}/**',
      '**/{karma,rollup,webpack,vite,vitest,jest,ava,babel,nyc,cypress,tsup,build}.config.*',
      '**/.next/**',
      '**/out/**',
      '**/build/**',
    ],
    include: [
      '**/__tests__/**/*.(js|jsx|ts|tsx)',
      '**/*.(test|spec).(js|jsx|ts|tsx)',
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
})
