import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
// `base` determines the public path when deployed. For GitHub Pages,
// set it to '/<repo>/' or derive from environment variables.
export default defineConfig({
  base: process.env.NODE_ENV === 'production' ? '/<repo>/' : '/',
  plugins: [react()],
})
