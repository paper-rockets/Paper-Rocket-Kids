import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import {defineConfig} from 'vite';

export default defineConfig(() => {
  return {
    base: '/Paper-Rocket-Kids/',
    plugins: [
      react(),
      tailwindcss(),
      {
        name: 'html-dev-transform',
        transformIndexHtml(html, ctx) {
          if (ctx.server) {
            return html
              .replace(/<script type="module" crossorigin src=".*?"><\/script>/, '<script type="module" src="/src/main.tsx"></script>')
              .replace(/<link rel="stylesheet" crossorigin href=".*?">/, '');
          }
          return html;
        },
      },
    ],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    server: {
      // HMR is disabled in AI Studio via DISABLE_HMR env var.
      // Do not modifyâfile watching is disabled to prevent flickering during agent edits.
      hmr: process.env.DISABLE_HMR !== 'true',
      // Disable file watching when DISABLE_HMR is true to save CPU during agent edits.
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
    },
  };
});
