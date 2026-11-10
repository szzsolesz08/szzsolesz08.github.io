/// <reference types="vitest/config" />
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// User site (szzsolesz08.github.io) is served from the domain root, so base stays '/'.
export default defineConfig({
  base: '/',
  plugins: [react()],
  build: {
    target: 'es2022',
    sourcemap: false,
  },
  test: {
    environment: 'node',
  },
})
