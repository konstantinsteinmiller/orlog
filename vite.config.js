import { defineConfig } from 'vite'
// import glsl from 'vite-plugin-glsl'
// import { threeMinifier } from '@yushijinhun/three-minifier-rollup'
import { resolve } from 'path'

// https://vitejs.dev/config/
export default defineConfig({
  resolve: {
    alias: {
      '@': resolve(__dirname, './src'),
    },
  },
  plugins: [
    // threeMinifier(),
    // glsl(),
  ],
})
