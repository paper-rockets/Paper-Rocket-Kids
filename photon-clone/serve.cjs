// Tiny local web server for the saved copy of the Photon Studio page.
// Run:  node serve.js      then open the links it prints.
const http = require('http');
const fs = require('fs');
const path = require('path');
const os = require('os');

const ROOT = __dirname;
const PORT = Number(process.env.PORT) || 3200;

const TYPES = {
  '.html': 'text/html; charset=utf-8', '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8', '.json': 'application/json; charset=utf-8',
  '.png': 'image/png', '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.svg': 'image/svg+xml',
  '.avif': 'image/avif', '.webp': 'image/webp', '.ico': 'image/x-icon',
  '.mp4': 'video/mp4', '.webm': 'video/webm', '.woff2': 'font/woff2', '.woff': 'font/woff',
};

// The live site answers this from its backend; we serve the snapshot taken at clone time.
const API_SNAPSHOTS = { '/api/v1/photon/releases/latest': 'api/v1/photon/releases/latest.json' };

function resolve(urlPath) {
  const clean = decodeURIComponent(urlPath.split('?')[0].split('#')[0]);
  if (API_SNAPSHOTS[clean]) return path.join(ROOT, API_SNAPSHOTS[clean]);
  let file = path.normalize(path.join(ROOT, clean));
  if (!file.startsWith(ROOT)) return null;             // no escaping the folder
  if (clean.endsWith('/')) file = path.join(file, 'index.html');
  if (fs.existsSync(file) && fs.statSync(file).isDirectory()) file = path.join(file, 'index.html');
  return file;
}

http.createServer((req, res) => {
  const file = resolve(req.url);
  if (!file || !fs.existsSync(file) || !fs.statSync(file).isFile()) {
    res.writeHead(404, { 'Content-Type': 'text/plain' });
    return res.end('Not found: ' + req.url);
  }
  const size = fs.statSync(file).size;
  const type = TYPES[path.extname(file).toLowerCase()] || 'application/octet-stream';
  const range = req.headers.range;                      // videos need byte ranges to play/seek
  if (range) {
    const m = /bytes=(\d*)-(\d*)/.exec(range);
    const start = m[1] ? parseInt(m[1], 10) : 0;
    const end = m[2] ? parseInt(m[2], 10) : size - 1;
    res.writeHead(206, {
      'Content-Type': type, 'Content-Length': end - start + 1,
      'Content-Range': `bytes ${start}-${end}/${size}`, 'Accept-Ranges': 'bytes',
    });
    return fs.createReadStream(file, { start, end }).pipe(res);
  }
  res.writeHead(200, { 'Content-Type': type, 'Content-Length': size, 'Accept-Ranges': 'bytes' });
  fs.createReadStream(file).pipe(res);
}).listen(PORT, '0.0.0.0', () => {
  const lan = Object.values(os.networkInterfaces()).flat()
    .find(n => n && n.family === 'IPv4' && !n.internal);
  console.log('');
  console.log('Photon page copy is running.');
  console.log('  On this computer:            http://localhost:' + PORT + '/photon/');
  if (lan) console.log('  On your phone (same Wi-Fi):  http://' + lan.address + ':' + PORT + '/photon/');
  console.log('');
  console.log('  Port: ' + PORT + '   (stop it with Ctrl+C)');
});
