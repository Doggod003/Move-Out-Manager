import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// IMPORTANT: 'base' must match your GitHub repo name exactly (case-sensitive)
// Repo: https://github.com/doggod003/Move-Out-Manager
// → base: '/Move-Out-Manager/'
export default defineConfig({
  plugins: [react()],
  base: '/Move-Out-Manager/',
  server: { port: 5173, host: true },
})
