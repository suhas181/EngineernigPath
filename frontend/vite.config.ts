import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

// https://vitejs.dev/config/
export default defineConfig(({ mode, command }) => {
  const env = loadEnv(mode, process.cwd(), '');
  const apiUrl = env.VITE_API_URL || process.env.VITE_API_URL;

  if (command === 'build' || mode === 'production') {
    if (!apiUrl || apiUrl.trim() === '') {
      throw new Error(
        '\n\n❌ [VITE BUILD ERROR] VITE_API_URL environment variable is mandatory for production builds but was not provided.\nPlease set VITE_API_URL to your live production backend URL in your deployment settings.\n'
      );
    }
    if (apiUrl.includes('localhost') || apiUrl.includes('127.0.0.1')) {
      throw new Error(
        `\n\n❌ [VITE BUILD ERROR] VITE_API_URL cannot point to localhost/127.0.0.1 in a production build (received: "${apiUrl}").\nPlease configure your live production backend API URL.\n`
      );
    }
  }

  return {
    plugins: [react()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src'),
      },
    },
    server: {
      port: 5173,
      host: true,
      proxy: {
        '/api': {
          target: 'http://127.0.0.1:5001',
          changeOrigin: true,
        },
      },
    },
  };
});
