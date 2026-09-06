import { defineConfig } from 'vite';
import fs from 'fs';
import path from 'path';

export default defineConfig({
  plugins: [
    {
      name: 'file-upload-handler',
      configureServer(server) {
        server.middlewares.use('/api/upload', (req, res) => {
          if (req.method === 'POST') {
            const uploadDir = path.resolve(process.cwd(), 'uploads');
            if (!fs.existsSync(uploadDir)) {
              fs.mkdirSync(uploadDir, { recursive: true });
            }

            const rawFilename = req.headers['x-filename'] || 'uploaded_file';
            const filename = decodeURIComponent(rawFilename);
            const targetPath = path.join(uploadDir, filename);
            const fileStream = fs.createWriteStream(targetPath);

            req.pipe(fileStream);

            fileStream.on('finish', () => {
              res.writeHead(200, {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
              });
              res.end(JSON.stringify({ success: true, filename, path: targetPath }));
            });

            fileStream.on('error', (err) => {
              res.writeHead(500, { 'Content-Type': 'application/json' });
              res.end(JSON.stringify({ error: err.message }));
            });
          } else {
            res.writeHead(405);
            res.end('Method Not Allowed');
          }
        });
      }
    }
  ],
  server: {
    host: '0.0.0.0',
    port: 5173,
    strictPort: true,
    allowedHosts: true
  }
});
