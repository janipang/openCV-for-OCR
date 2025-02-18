import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
// import defineElectronConfig from "vite-plugin-electron"

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(),
  // defineElectronConfig({
  //   entry: '../main.js', // Main process entry point
  //   vite: {
  //     server: {
  //       fs: {
  //         allow: ['src'] // Allow Vite to access necessary folders
  //       }
  //     }
  //   }
  // })
],
  base: './',
  build: {
    outDir: 'dist',
  }
})
