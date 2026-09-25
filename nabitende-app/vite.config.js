import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.svg', 'icon-192.png', 'icon-512.png'],
      manifest: {
        name: 'Nabitende Secondary School',
        short_name: 'Nabitende SS',
        description: 'School management app for Nabitende Secondary School',
        theme_color: '#1a6b4a',
        background_color: '#ffffff',
        display: 'standalone',
        start_url: '/',
        scope: '/',
        icons: [
          { src: '/icon-192.png', sizes: '192x192', type: 'image/png' },
          { src: '/icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'any maskable' },
        ],
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg}'],
        navigateFallback: '/index.html',
        runtimeCaching: [
          {
            // Cache Supabase REST responses so the last-seen data is visible offline,
            // and refresh it in the background whenever there's a connection.
            urlPattern: /^https:\/\/.*\.supabase\.co\/rest\/v1\/.*/i,
            handler: 'StaleWhileRevalidate',
            options: { cacheName: 'supabase-data', expiration: { maxEntries: 100, maxAgeSeconds: 86400 } },
          },
        ],
      },
    }),
  ],
})