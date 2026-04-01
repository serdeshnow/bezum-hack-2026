/// <reference types="vitest/config" />

import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'
import tailwindcss from '@tailwindcss/vite'
import tsconfigPaths from 'vite-tsconfig-paths'
import pkg from './package.json'

// https://vite.dev/config/
export default defineConfig({
  publicDir: 'public',
  plugins: [react(), tailwindcss(), tsconfigPaths()],
  server: {
    port: 3000,
    open: true,
  },
  build: {
    assetsDir: 'static',
    outDir: 'build',
    sourcemap: true
  },
  define: {
    __APP_VERSION__: JSON.stringify(pkg.version),
  },
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './vitest.setup.ts',
    include: ['tests/unit/**/*.test.{ts,tsx}'],
    css: true,
  },
})
