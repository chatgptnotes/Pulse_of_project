import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'
import { fileURLToPath } from 'url'
import { readFileSync } from 'fs'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

// Read package.json for version info
const packageJson = JSON.parse(
  readFileSync(path.join(__dirname, 'apps/web/package.json'), 'utf-8')
)

// Get current date for build timestamp
const buildDate = new Date().toISOString().split('T')[0]

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  // Load env file based on `mode` in the current working directory.
  // Set the third parameter to '' to load all env regardless of the `VITE_` prefix.
  const env = loadEnv(mode, __dirname, '')

  return {
    plugins: [react()],
    css: {
      postcss: './postcss.config.cjs',
    },
    root: '.',
    publicDir: 'apps/web/public',
    // Explicitly set envDir to repository root so .env files are loaded correctly
    envDir: __dirname,
    // Explicitly define environment variables to ensure they're injected into the bundle
    define: {
      'import.meta.env.VITE_BYPASS_AUTH': JSON.stringify(env.VITE_BYPASS_AUTH || 'false'),
      'import.meta.env.VITE_SUPABASE_URL': JSON.stringify(env.VITE_SUPABASE_URL || 'https://winhdjtlwhgdoinfrxch.supabase.co'),
      'import.meta.env.VITE_SUPABASE_ANON_KEY': JSON.stringify(env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndpbmhkanRsd2hnZG9pbmZyeGNoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjEzNTkwNTQsImV4cCI6MjA3NjkzNTA1NH0.IKxXiHRZiJI4UXfbAiYThXcsvdx04vqx0ejQs8LhkGU'),
      'import.meta.env.VITE_BUGTRACKING_SUPABASE_URL': JSON.stringify(env.VITE_BUGTRACKING_SUPABASE_URL || 'https://winhdjtlwhgdoinfrxch.supabase.co'),
      'import.meta.env.VITE_BUGTRACKING_SUPABASE_ANON_KEY': JSON.stringify(env.VITE_BUGTRACKING_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndpbmhkanRsd2hnZG9pbmZyeGNoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjEzNTkwNTQsImV4cCI6MjA3NjkzNTA1NH0.IKxXiHRZiJI4UXfbAiYThXcsvdx04vqx0ejQs8LhkGU'),
      // Version and build info
      'import.meta.env.VITE_APP_VERSION': JSON.stringify(packageJson.version),
      'import.meta.env.VITE_APP_NAME': JSON.stringify(packageJson.name),
      'import.meta.env.VITE_BUILD_DATE': JSON.stringify(buildDate),
    },
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
