import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

/** GitHub Actions sets VITE_BASE_PATH=/<repository>/ for project Pages. */
export default defineConfig({
  plugins: [react()],
  base: process.env.VITE_BASE_PATH ?? '/',
});
