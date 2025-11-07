import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  // Load env file based on `mode` in the current working directory.
  // Set the third parameter to '' to load all env regardless of the `VITE_` prefix.
  const env = loadEnv(mode, __dirname, '')

  console.log('🔧 Vite Config - Mode:', mode)
  console.log('🔧 Vite Config - __dirname:', __dirname)
  console.log('🔧 Vite Config - VITE_BYPASS_AUTH:', env.VITE_BYPASS_AUTH)

  return {
    plugins: [react()],
    css: {
      postcss: './postcss.config.cjs',
    },
    root: '.',
    publicDir: 'apps/web/public',
    // Explicitly set envDir to repository root so .env files are loaded correctly
    envDir: __dirname,
    server: {
      port: 3000,
      open: true,
    },
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './apps/web/src'),
        '@api': path.resolve(__dirname, './packages/api/src'),
      },
    },
    build: {
      outDir: 'dist',
      sourcemap: true,
    },
  }
})
