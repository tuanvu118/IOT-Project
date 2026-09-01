import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'
import fs from 'fs'

const certPath = './certs/localhost+lan.pem'
const keyPath = './certs/localhost+lan-key.pem'
const hasCerts = fs.existsSync(certPath) && fs.existsSync(keyPath)

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

    ...(hasCerts
      ? {
          https: {
            key: fs.readFileSync(keyPath),
            cert: fs.readFileSync(certPath),
          },
        }
      : {}),

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