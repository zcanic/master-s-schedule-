import path from 'path';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

const normalizeBase = (base: string): string => {
  if (!base || base === '/') {
    return '/';
  }

  const withLeadingSlash = base.startsWith('/') ? base : `/${base}`;
  return withLeadingSlash.endsWith('/') ? withLeadingSlash : `${withLeadingSlash}/`;
};

export default defineConfig(({ mode }) => {
    const env = loadEnv(mode, '.', '');
    const preferredBase = env.VITE_BASE_PATH || (env.VERCEL ? '/' : '/schedule/');
    const basePath = normalizeBase(preferredBase);
    const fallbackHtml = basePath === '/' ? '/index.html' : `${basePath}index.html`;

    return {
      base: basePath,
      server: {
        port: 3000,
        host: '0.0.0.0',
      },
      plugins: [
        react(),
        VitePWA({
          registerType: 'autoUpdate',
          injectRegister: 'auto',
          includeAssets: ['favicon.svg', 'robots.txt', 'apple-touch-icon.png'],
          manifest: {
            id: basePath,
            name: "Master's Schedule - zcanic Pro",
            short_name: 'MSchedule',
            description: '研究生课表管理与可视化工具，支持离线访问与安装到主屏幕。',
            start_url: basePath,
            scope: basePath,
            display: 'standalone',
            background_color: '#f8fafc',
            theme_color: '#0f172a',
            icons: [
              {
                src: 'pwa-192x192.png',
                sizes: '192x192',
                type: 'image/png',
              },
              {
                src: 'pwa-512x512.png',
                sizes: '512x512',
                type: 'image/png',
              },
              {
                src: 'pwa-512x512.png',
                sizes: '512x512',
                type: 'image/png',
                purpose: 'any maskable',
              },
            ],
          },
          workbox: {
            navigateFallback: fallbackHtml,
            navigateFallbackDenylist: [/^\/api\//],
            globPatterns: ['**/*.{js,css,html,ico,png,svg,webp,woff2}'],
            runtimeCaching: [
              {
                urlPattern: /^https:\/\/kvapi\.zc13501500964\.workers\.dev\/.*/i,
                handler: 'NetworkFirst',
                options: {
                  cacheName: 'void-api-cache',
                  networkTimeoutSeconds: 5,
                  expiration: {
                    maxEntries: 100,
                    maxAgeSeconds: 24 * 60 * 60,
                  },
                  cacheableResponse: {
                    statuses: [0, 200],
                  },
                },
              },
              {
                urlPattern: /^https?:\/\/.*\.(?:png|jpg|jpeg|svg|webp|gif)$/i,
                handler: 'CacheFirst',
                options: {
                  cacheName: 'image-cache',
                  expiration: {
                    maxEntries: 200,
                    maxAgeSeconds: 30 * 24 * 60 * 60,
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
          },
        }),
      ],
      define: {
        'process.env.API_KEY': JSON.stringify(env.GEMINI_API_KEY),
        'process.env.GEMINI_API_KEY': JSON.stringify(env.GEMINI_API_KEY)
      },
      resolve: {
        alias: {
          '@': path.resolve(__dirname, '.'),
        }
      }
    };
});
