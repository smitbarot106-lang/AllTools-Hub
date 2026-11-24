/* AllTools Hub - local preview server.  Run:  node dev-server.js [port]
   Behaves like the production hosts: clean URLs (/word-counter serves word-counter.html), a 308 redirect from
   /word-counter.html to /word-counter, the response headers from vercel.json, and 404.html for unknown pages. */
'use strict';
const http = require('http');
const fs = require('fs');
const path = require('path');

const ROOT = __dirname;
const PORT = Number(process.argv[2] || process.env.PORT || 3000);
const TYPES = { '.html': 'text/html; charset=utf-8', '.css': 'text/css; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.json': 'application/json', '.svg': 'image/svg+xml', '.png': 'image/png', '.xml': 'application/xml', '.txt': 'text/plain; charset=utf-8' };
const config = JSON.parse(fs.readFileSync(path.join(ROOT, 'vercel.json'), 'utf8'));
const globalHeaders = config.headers.find(h => h.source === '/(.*)').headers;

function send(res, status, file, extra) {
  const headers = Object.assign({ 'Content-Type': TYPES[path.extname(file)] || 'application/octet-stream' }, extra || {});
  globalHeaders.forEach(h => { headers[h.key] = h.value; });
  res.writeHead(status, headers);
  fs.createReadStream(file).pipe(res);
}

http.createServer((req, res) => {
  const url = new URL(req.url, 'http://localhost');
  let p = decodeURIComponent(url.pathname);
  if (p.endsWith('.html') && p !== '/404.html') {
    const clean = p.replace(/\.html$/, '').replace(/\/index$/, '/') || '/';
    res.writeHead(308, { Location: clean + url.search });
    return res.end();
  }
  if (p.length > 1 && p.endsWith('/')) { res.writeHead(308, { Location: p.slice(0, -1) + url.search }); return res.end(); }
  const rel = p === '/' ? 'index.html' : p.slice(1);
  const candidates = [rel, rel + '.html'].map(c => path.join(ROOT, c));
  const file = candidates.find(c => c.startsWith(ROOT) && fs.existsSync(c) && fs.statSync(c).isFile() && !c.includes(path.sep + '.'));
  if (file) return send(res, 200, file);
  send(res, 404, path.join(ROOT, '404.html'));
}).listen(PORT, () => console.log('AllTools Hub preview on http://localhost:' + PORT));
