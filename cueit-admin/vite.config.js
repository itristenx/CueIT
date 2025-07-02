import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwind from '@tailwindcss/vite'; // ✅ import the Tailwind plugin

export default defineConfig({
  plugins: [
    react(),
    tailwind() // ✅ enable Tailwind
  ],
});