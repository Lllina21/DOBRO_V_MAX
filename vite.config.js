import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react({
    // Отключаем предупреждения о Fast Refresh для контекстов
    fastRefresh: true
  })],
  server: {
    port: 3000,
    host: true
  },
  build: {
    outDir: 'dist',
    sourcemap: false
  },
  // Подавляем предупреждения React Router
  define: {
    'process.env': {}
  }
})

