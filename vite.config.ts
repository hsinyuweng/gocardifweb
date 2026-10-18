import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

// GitHub Pages 發布於 https://lsjle.github.io/gocardifweb/（第 4 節）
export default defineConfig({
  base: '/gocardifweb/',
  plugins: [react(), tailwindcss()],
});
