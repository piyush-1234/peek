import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import fs from 'fs';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  server: {
    host: '0.0.0.0',
    port: 3443,
    allowedHosts: true,
    https: {
      key: fs.readFileSync(path.resolve('../server/certs/172.28.202.191+3-key.pem')),
      cert: fs.readFileSync(path.resolve('../server/certs/172.28.202.191+3.pem')),
    },
  },
  preview: {
    host: '0.0.0.0',
    port: 3443,
    allowedHosts: true,
    https: {
      key: fs.readFileSync(path.resolve('../server/certs/172.28.202.191+3-key.pem')),
      cert: fs.readFileSync(path.resolve('../server/certs/172.28.202.191+3.pem')),
    },
  },
});