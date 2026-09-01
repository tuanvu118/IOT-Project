import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'
import fs from 'fs'

export default defineConfig({
  plugins: [
    react(),

    VitePWA({
      strategies: 'generateSW',
      registerType: 'autoUpdate',
      injectRegister: 'script',
      includeAssets: [
        'favicon.svg',
        'icon-192.png',
        'icon-512.png',
      ],
      manifest: false,

      devOptions: {
        enabled: true,
      },

      workbox: {
        cleanupOutdatedCaches: true,
        clientsClaim: true,
        skipWaiting: true,
      },
    }),
  ],

  server: {
    host: '0.0.0.0',
    port: 5173,

    https: {
      key: fs.readFileSync('./certs/localhost+lan-key.pem'),
      cert: fs.readFileSync('./certs/localhost+lan.pem'),
    },

    proxy: {
      '/api': {
        target: 'http://backend:8000',
        changeOrigin: true,
      },
    },

    watch: {
      usePolling: true,
    },

    hmr: {
      clientPort: 5173,
    },
  },
})