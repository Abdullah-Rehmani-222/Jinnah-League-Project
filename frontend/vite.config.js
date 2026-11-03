import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig(({ command, mode }) => {
  // Fail the production build instead of silently shipping a site that calls http://localhost:5000
  // (visitors cannot reach localhost, and admins get logged straight back out).
  if (command === 'build') {
    const api = loadEnv(mode, process.cwd(), 'VITE_').VITE_API_URL
    const isLocal = !api || /^https?:\/\/(localhost|127\.0\.0\.1|\[::1\])/i.test(api)
    if (isLocal && mode !== 'localapi')
      throw new Error(
        `VITE_API_URL is ${api ? `"${api}"` : 'not set'}, which is a local address.\n` +
          'Set the deployed API in frontend/.env.production, e.g. VITE_API_URL=https://your-api.onrender.com/api\n' +
          '(or run: npm run build:local).',
      )
  }

  return {
    plugins: [react()],
    base: '/Jinnah-League-Project/', // GitHub Pages project path; use '/' for a custom domain
    resolve: { alias: { '@': path.resolve(__dirname, './src') } },
  }
})
