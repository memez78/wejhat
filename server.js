import http from 'http';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = process.env.PORT || 5000;
const HOST = '0.0.0.0';

const MIME_TYPES = {
  '.html': 'text/html',
  '.css': 'text/css',
  '.js': 'text/javascript',
  '.json': 'application/json',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.webp': 'image/webp',
  '.webmanifest': 'application/manifest+json'
};

const server = http.createServer((req, res) => {
  console.log(`${req.method} ${req.url}`);
  
  // Handle favicon
  if (req.url === '/favicon.ico') {
    return serveFile(res, path.join(__dirname, 'icons', 'icon-192x192.png'), 'image/png');
  }

  // Handle service worker
  if (req.url === '/service-worker.js') {
    return serveFile(res, path.join(__dirname, 'service-worker.js'), 'text/javascript');
  }

  // If the URL is just '/', serve index.html
  let filePath = req.url === '/' 
    ? path.join(__dirname, 'index.html') 
    : path.join(__dirname, req.url);

  const extname = path.extname(filePath);
  const contentType = MIME_TYPES[extname] || 'text/plain';

  fs.readFile(filePath, (err, content) => {
    if (err) {
      if (err.code === 'ENOENT') {
        // File not found, try to serve index.html
        fs.readFile(path.join(__dirname, 'index.html'), (err, content) => {
          if (err) {
            res.writeHead(500);
            res.end('Server Error');
            return;
          }
          serveFile(res, path.join(__dirname, 'index.html'), 'text/html');
        });
      } else {
        // Server error
        res.writeHead(500);
        res.end(`Server Error: ${err.code}`);
      }
      return;
    }

    // Success - serve the file
    serveFile(res, filePath, contentType);
  });
});

function serveFile(res, filePath, contentType) {
  fs.readFile(filePath, (err, content) => {
    if (err) {
      res.writeHead(500);
      res.end(`Server Error: ${err.code}`);
      return;
    }

    res.writeHead(200, { 'Content-Type': contentType });
    res.end(content, 'utf-8');
  });
}

server.listen(PORT, HOST, () => {
  console.log(`Server running at http://localhost:${PORT}/`);
  console.log(`Press Ctrl+C to stop the server`);
});