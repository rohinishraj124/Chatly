import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd());

  return {
    plugins: [react()],
    server: {
      host: '0.0.0.0',
      port: 5174,
      hmr: {
        host: '54.191.101.14',
        protocol: 'ws',
      },
    },
    base: './',
    define: {
      'process.env': env,
    },
  };
});

