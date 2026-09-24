import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import {defineConfig} from 'vite';
import {VitePWA} from 'vite-plugin-pwa';

export default defineConfig(() => {
  return {
    plugins: [
      react(),
      tailwindcss(),
      VitePWA({
        registerType: 'autoUpdate',
        includeAssets: [
          'icon.svg',
          'apple-touch-icon.png',
          'pwa-192x192.png',
          'pwa-512x512.png',
          'sw-custom.js',
          'timer-worker.js',
          'widgets/hydroflow-template.json',
          'widgets/hydroflow-data.json',
        ],
        manifest: {
          id: '/',
          name: 'HydroFlow - Material 3 Water Tracker',
          short_name: 'HydroFlow',
          description: 'Material 3 hydration tracker with dark mode, offline support, interval reminders, cup/bottle tracking, and analytics.',
          theme_color: '#0284c7',
          background_color: '#0f172a',
          display: 'standalone',
          start_url: '/',
          scope: '/',
          icons: [
            {
              src: '/pwa-192x192.png',
              sizes: '192x192',
              type: 'image/png',
              purpose: 'any',
            },
            {
              src: '/pwa-512x512.png',
              sizes: '512x512',
              type: 'image/png',
              purpose: 'any',
            },
            {
              src: '/pwa-maskable-512x512.png',
              sizes: '512x512',
              type: 'image/png',
              purpose: 'maskable',
            },
          ],
          shortcuts: [
            {
              name: 'Log Cup (+250ml)',
              short_name: 'Log Cup',
              description: 'Quickly log 250ml of water',
              url: '/?action=log_cup',
              icons: [{ src: '/pwa-192x192.png', sizes: '192x192' }],
            },
            {
              name: 'Log Bottle (+500ml)',
              short_name: 'Log Bottle',
              description: 'Quickly log 500ml of water',
              url: '/?action=log_bottle',
              icons: [{ src: '/pwa-192x192.png', sizes: '192x192' }],
            },
            {
              name: 'Progress Widget',
              short_name: 'Widget',
              description: 'Glanceable progress widget',
              url: '/?mode=widget',
              icons: [{ src: '/pwa-192x192.png', sizes: '192x192' }],
            },
          ],
          // W3C PWA Widgets specification for Windows 11 & Android PWA Widget boards
          // @ts-expect-error PWA manifest widgets extension
          widgets: [
            {
              name: 'HydroFlow Progress Widget',
              short_name: 'Hydration',
              description: 'Glanceable daily hydration progress, streak, and quick drink action',
              tag: 'hydroflow-progress',
              template: 'hydroflow-widget',
              ms_ac_template: '/widgets/hydroflow-template.json',
              data: '/widgets/hydroflow-data.json',
              type: 'application/json',
              screenshots: [
                {
                  src: '/pwa-512x512.png',
                  sizes: '512x512',
                  label: 'HydroFlow Hydration Progress Widget',
                },
              ],
              icons: [
                {
                  src: '/pwa-192x192.png',
                  sizes: '192x192',
                },
              ],
              auth: false,
              update: 900,
            },
          ],
        },
        workbox: {
          importScripts: ['/sw-custom.js'],
          globPatterns: ['**/*.{js,css,html,ico,png,svg,woff,woff2}'],
          runtimeCaching: [
            {
              urlPattern: /^https:\/\/fonts\.googleapis\.com\/.*/i,
              handler: 'CacheFirst',
              options: {
                cacheName: 'google-fonts-cache',
                expiration: {
                  maxEntries: 10,
                  maxAgeSeconds: 60 * 60 * 24 * 365,
                },
                cacheableResponse: {
                  statuses: [0, 200],
                },
              },
            },
            {
              urlPattern: /^https:\/\/fonts\.gstatic\.com\/.*/i,
              handler: 'CacheFirst',
              options: {
                cacheName: 'gstatic-fonts-cache',
                expiration: {
                  maxEntries: 20,
                  maxAgeSeconds: 60 * 60 * 24 * 365,
                },
                cacheableResponse: {
                  statuses: [0, 200],
                },
              },
            },
          ],
        },
        devOptions: {
          enabled: true,
          type: 'module',
        },
      }),
    ],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    server: {
      // HMR is disabled in AI Studio via DISABLE_HMR env var.
      // Do not modifyâfile watching is disabled to prevent flickering during agent edits.
      hmr: process.env.DISABLE_HMR !== 'true',
      // Disable file watching when DISABLE_HMR is true to save CPU during agent edits.
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
    },
  };
});
