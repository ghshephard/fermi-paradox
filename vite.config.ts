import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    // The lazily loaded Three.js scene is ~930 kB on its own.
    chunkSizeWarningLimit: 1000,
  },
})
