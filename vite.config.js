import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  build: {
    rollupOptions: {
      // 'firebase/app' and 'firebase/auth' are only loaded at RUNTIME
      // (see src/services/authService.js signInWithGoogle), and only once
      // Google sign-in is actually configured and used. They are marked
      // external so the build does not require `firebase` to be installed
      // unless/until you run `npm install firebase` to enable that feature.
      external: ['firebase/app', 'firebase/auth'],
    },
  },
})
