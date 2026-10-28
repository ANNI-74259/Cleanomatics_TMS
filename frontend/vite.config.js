import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// Frontend runs on http://localhost:5173 (same as CLIENT_URL in backend .env)
export default defineConfig({
  plugins: [react()],
  server: { port: 5173 },
});
