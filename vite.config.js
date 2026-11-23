import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

// https://vite.dev/config/
export default defineConfig({
  // Relative asset URLs: the same build works on GitHub Pages (served from the domain root) and
  // inside the Electron app (served from the app:// protocol). The app has no client-side router.
  base: './',
  plugins: [react()],
});
