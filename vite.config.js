import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api_proxy': {
        target: 'https://api.latam.equifax.com',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api_proxy/, ''),
      },
      '/auth-api': {
        target: 'https://sigmaplussecurityqa-frfnchc3f4htc0ey.eastus-01.azurewebsites.net',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/auth-api/, ''),
      },
    },
  },
})
