import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// json-server yozganda Vite sahifani qayta yuklamasligi uchun data json fayllarini watch'dan chiqaramiz.
export default defineConfig({
  plugins: [react()],
  server: {
    watch: {
      ignored: ['**/data/*.json'],
    },
  },
})
