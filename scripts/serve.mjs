import http from 'node:http';
import path from 'node:path';
import { readFile, stat } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';

const projectRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const publicRoot = path.join(projectRoot, 'portfolio');
const host = '127.0.0.1';
const port = Number(process.env.PORT || 4173);

const routes = new Map([
  ['/', 'index.html'],
  ['/projects', 'projects.html'],
  ['/blogs', 'blogs.html'],
  ['/gallery', 'gallery.html'],
  ['/resume', 'resume.html'],
  ['/contact', 'contact.html']
]);

const mimeTypes = {
  '.css': 'text/css; charset=utf-8',
  '.docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  '.html': 'text/html; charset=utf-8',
  '.jpg': 'image/jpeg',
  '.js': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.mp3': 'audio/mpeg',
  '.pdf': 'application/pdf',
  '.png': 'image/png',
  '.svg': 'image/svg+xml'
};

function send(response, status, body, headers = {}) {
  response.writeHead(status, {
    'Cache-Control': 'no-store',
    'X-Content-Type-Options': 'nosniff',
    ...headers
  });
  response.end(body);
}

const server = http.createServer(async (request, response) => {
  try {
    const requestUrl = new URL(request.url || '/', `http://${host}:${port}`);

    if (requestUrl.pathname.startsWith('/api/')) {
      send(response, 501, JSON.stringify({ error: 'Use vercel dev to test API routes.' }), {
        'Content-Type': 'application/json; charset=utf-8'
      });
      return;
    }

    const routeFile = routes.get(requestUrl.pathname);
    const relativePath = routeFile || decodeURIComponent(requestUrl.pathname).replace(/^\/+/, '');
    const filePath = path.resolve(publicRoot, relativePath);

    if (filePath !== publicRoot && !filePath.startsWith(`${publicRoot}${path.sep}`)) {
      send(response, 403, 'Forbidden', { 'Content-Type': 'text/plain; charset=utf-8' });
      return;
    }

    const fileInfo = await stat(filePath);
    if (!fileInfo.isFile()) throw new Error('Not a file');

    const body = request.method === 'HEAD' ? '' : await readFile(filePath);
    send(response, 200, body, {
      'Content-Length': request.method === 'HEAD' ? fileInfo.size : body.length,
      'Content-Type': mimeTypes[path.extname(filePath).toLowerCase()] || 'application/octet-stream'
    });
  } catch {
    send(response, 404, 'Not found', { 'Content-Type': 'text/plain; charset=utf-8' });
  }
});

server.listen(port, host, () => {
  console.log(`Portfolio preview: http://${host}:${port}`);
});
