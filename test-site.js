/* AllTools Hub - checks on the generated site.  Run:  node build.js && node test-site.js
   Verifies SEO basics, internal links, CSP-safe markup, the sitemap, and that every worked example
   written in content.js matches what the real tool returns. */
'use strict';
const fs = require('fs');
const path = require('path');
const { TOOLS, CATEGORIES } = require('./tools.js');
const { TOOL_CONTENT, CATEGORY_CONTENT, GUIDES } = require('./content.js');

const ROOT = __dirname;
let failed = 0, passed = 0;
const ok = (cond, msg) => { if (cond) passed++; else { failed++; console.error('FAIL: ' + msg); } };

const walk = dir => fs.readdirSync(dir, { withFileTypes: true }).flatMap(e =>
  e.isDirectory() ? (e.name.startsWith('.') || e.name === 'node_modules' ? [] : walk(path.join(dir, e.name))) : [path.join(dir, e.name)]);
const pages = walk(ROOT).filter(f => f.endsWith('.html')).map(f => path.relative(ROOT, f));
const urlOf = f => '/' + f.replace(/\.html$/, '').replace(/^index$/, '');
const known = new Set(pages.map(urlOf));
['/favicon.svg', '/og-image.png', '/apple-touch-icon.png', '/sitemap.xml', '/robots.txt', '/ads.txt'].forEach(u => known.add(u));
const assetFiles = new Set(['/style.css', '/site.js', '/tool.js', '/tools.js', '/home.js']);

const titles = new Map(), descs = new Map();
for (const f of pages) {
  const html = fs.readFileSync(path.join(ROOT, f), 'utf8');
  const url = urlOf(f);
  const one = re => (html.match(re) || [])[1];
  const title = one(/<title>([^<]*)<\/title>/), desc = one(/<meta name="description" content="([^"]*)"/);

  ok(title && title.length >= 15 && title.length <= 75, `${f}: title length ${title && title.length}`);
  ok(desc && desc.length >= 50 && desc.length <= 175, `${f}: description length ${desc && desc.length}`);
  ok((html.match(/<h1[ >]/g) || []).length === 1, `${f}: exactly one h1`);
  ok(/<html lang="en">/.test(html), `${f}: html lang`);
  ok(/<meta name="viewport"/.test(html), `${f}: viewport`);
  ok(/<link rel="canonical" href="https?:\/\/[^"]+">/.test(html), `${f}: canonical`);
  ok(/<meta property="og:image" content="[^"]+og-image\.png">/.test(html), `${f}: og:image png`);
  ok(/<main id="main">/.test(html), `${f}: main landmark`);
  ok(!/\sstyle="/.test(html), `${f}: no inline style attributes (CSP style-src 'self')`);
  const scripts = [...html.matchAll(/<script([^>]*)>/g)].map(m => m[1]);
  ok(scripts.every(a => /src=|type="application\/ld\+json"/.test(a)), `${f}: no inline executable scripts`);
  ok(!/<img(?![^>]*\balt=)/.test(html), `${f}: img alt`);
  for (const m of html.matchAll(/<script type="application\/ld\+json">([^<]*)<\/script>/g)) {
    try { JSON.parse(m[1]); passed++; } catch (e) { failed++; console.error(`FAIL: ${f}: invalid JSON-LD`); }
  }
  if (f !== '404.html') {
    ok(!titles.has(title), `${f}: duplicate title (also ${titles.get(title)})`); titles.set(title, f);
    ok(!descs.has(desc), `${f}: duplicate description (also ${descs.get(desc)})`); descs.set(desc, f);
  }
  const ids = new Set([...html.matchAll(/\sid="([^"]+)"/g)].map(m => m[1]));
  ok(ids.size === [...html.matchAll(/\sid="([^"]+)"/g)].length, `${f}: duplicate element ids`);
  for (const m of html.matchAll(/(?:href|src|action)="(\/[^"#?]*)(?:\?[^"]*)?(#[^"]*)?"/g)) {
    const target = m[1] === '' ? '/' : m[1];
    ok(known.has(target) || assetFiles.has(target), `${f}: broken internal link ${target}`);
    if (m[2] && target === url) ok(ids.has(m[2].slice(1)), `${f}: missing anchor ${m[2]}`);
  }
  for (const m of html.matchAll(/(?:href|src)="(\/[^"]*\?v=[a-f0-9]{8})"/g)) ok(fs.existsSync(path.join(ROOT, m[1].split('?')[0])), `${f}: asset ${m[1]} missing`);
  for (const m of html.matchAll(/href="\/#([^"]+)"/g)) if (f === 'index.html') ok(ids.has(m[1]), `index: missing anchor #${m[1]}`);
}

/* every tool, category and guide has a page and content */
for (const t of TOOLS) {
  ok(known.has('/' + t.id), `tool page missing: ${t.id}`);
  const c = TOOL_CONTENT[t.id];
  ok(c && c.about.length && c.uses.length && c.limits.length && c.faqs.length >= 3, `${t.id}: content incomplete`);
}
for (const c of CATEGORIES) if (CATEGORY_CONTENT[c.id]) ok(known.has('/' + CATEGORY_CONTENT[c.id].slug), `category page missing: ${c.id}`);
for (const g of GUIDES) ok(known.has('/guides/' + g.slug), `guide page missing: ${g.slug}`);

/* sitemap lists every indexable page and nothing else */
const sitemap = fs.readFileSync(path.join(ROOT, 'sitemap.xml'), 'utf8');
const mapped = new Set([...sitemap.matchAll(/<loc>https?:\/\/[^/]+([^<]*)<\/loc>/g)].map(m => m[1] || '/'));
for (const u of known) if (!/\.(svg|png|xml|txt)$/.test(u) && u !== '/404') ok(mapped.has(u), `sitemap missing ${u}`);
for (const u of mapped) ok(known.has(u), `sitemap lists unknown page ${u}`);
ok(/Sitemap: https?:\/\//.test(fs.readFileSync(path.join(ROOT, 'robots.txt'), 'utf8')), 'robots.txt sitemap line');
ok(/^google\.com, pub-\d+, DIRECT, f08c47fec0942fa0$/m.test(fs.readFileSync(path.join(ROOT, 'ads.txt'), 'utf8')), 'ads.txt format');

/* worked examples must match the tools */
const T = id => TOOLS.find(t => t.id === id);
const defaults = t => Object.fromEntries(t.fields.map(f => [f.name, f.type === 'checkbox' ? !!f.default : (f.default != null ? f.default : '')]));
for (const [id, c] of Object.entries(TOOL_CONTENT)) {
  if (!c.check) continue;
  const t = T(id);
  const r = t.run(Object.assign(defaults(t), c.check.inputs));
  if (c.check.text != null) ok(r.text === c.check.text, `${id}: example text ${JSON.stringify(r.text)} != ${JSON.stringify(c.check.text)}`);
  else {
    const stat = (r.stats || []).find(s => s[0] === c.check.label);
    ok(stat && stat[1] === c.check.equals, `${id}: example ${c.check.label} = ${stat && stat[1]}, expected ${c.check.equals}`);
  }
}

/* security headers config */
const vercel = JSON.parse(fs.readFileSync(path.join(ROOT, 'vercel.json'), 'utf8'));
const csp = vercel.headers[0].headers.find(h => h.key === 'Content-Security-Policy').value;
ok(/script-src 'self'/.test(csp) && !/script-src[^;]*'unsafe-inline'/.test(csp), 'CSP script-src is strict');
ok(/pagead2\.googlesyndication\.com/.test(csp), 'CSP allows the AdSense script');
ok(/frame-ancestors 'none'/.test(csp) && /object-src 'none'/.test(csp), 'CSP frame-ancestors and object-src');
ok(/Content-Security-Policy/.test(fs.readFileSync(path.join(ROOT, '_headers'), 'utf8')), '_headers has CSP');

console.log(`${passed} passed, ${failed} failed (${pages.length} pages checked)`);
process.exit(failed ? 1 : 0);
