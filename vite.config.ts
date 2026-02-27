import path from 'path';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
    const env = loadEnv(mode, '.', '');
    const isVercel = process.env.VERCEL === '1' || process.env.VERCEL === 'true';
    const rawBase = env.VITE_BASE_PATH || (isVercel ? '/' : '/schedule/');
    const normalizedBase = rawBase.endsWith('/') ? rawBase : `${rawBase}/`;
    return {
      base: normalizedBase,
      server: {
        port: 3000,
        host: '0.0.0.0',
      },
      plugins: [react()],
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
