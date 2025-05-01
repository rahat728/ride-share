import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    port: 5173,
    proxy: {

      '/api': {
        target: 'http://localhost:5000', // your backend server
        changeOrigin: true,
        secure: false,
        ws: true,              // ✅ enable websocket support
        timeout: 60000,        // optional: increase timeout to 60s
        proxyTimeout: 60000,
      },
      '/socket.io': {
        target: 'http://localhost:5000',
        ws: true,
        changeOrigin: true,
        secure: false,
      },
    },
  },
})
