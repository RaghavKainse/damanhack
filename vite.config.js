import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      '/draw-api': {
        target: 'https://draw.ar-lottery06.com',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/draw-api/, ''),
        secure: false,
      }
    }
  }
})
