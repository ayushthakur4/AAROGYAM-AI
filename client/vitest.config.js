import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { fileURLToPath } from 'node:url'
import path from 'node:path'

const clientDir = path.dirname(fileURLToPath(import.meta.url))
const projectRoot = path.resolve(clientDir, '..')

export default defineConfig({
  root: projectRoot,
  plugins: [react(), tailwindcss()],
  test: {
    environment: 'jsdom',
    include: ['client/src/**/*.test.{js,jsx}', 'supabase/tests/**/*.test.js'],
    setupFiles: path.join(clientDir, 'src/test/setup.js'),
    css: false,
  },
})
