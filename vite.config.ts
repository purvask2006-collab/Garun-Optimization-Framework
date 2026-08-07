import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import path from 'path';

export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    port: 3000,
    host: '0.0.0.0',
    allowedHosts: true,
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
    dedupe: ['three', 'react', 'react-dom', '@react-three/fiber', '@react-three/drei'],
  },
  optimizeDeps: {
    include: ['three', '@react-three/fiber', '@react-three/drei', 'lucide-react', 'recharts', 'zustand'],
  },
});

