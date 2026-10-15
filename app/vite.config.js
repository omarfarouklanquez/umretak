import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  base: './', // relative assets: works on GitHub Pages sub-paths (app uses HashRouter)
  plugins: [react()],
})
