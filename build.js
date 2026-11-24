/* AllTools Hub - page generator.
   Run:  node build.js
   It reads tools.js and content.js and writes every HTML page, sitemap.xml, robots.txt,
   ads.txt, _headers (Cloudflare Pages) and vercel.json (Vercel).
   Set SITE_URL to change the address used in canonical links, the sitemap and social tags. */
'use strict';
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const { TOOLS, CATEGORIES } = require('./tools.js');
const { TOOL_CONTENT, CATEGORY_CONTENT, GUIDES } = require('./content.js');

const ROOT = __dirname;
const SITE = (process.env.SITE_URL || 'https://alltools-hub.pages.dev').replace(/\/+$/, '');
const BUILD_DATE = '2026-11-24';
const ADSENSE_CLIENT = 'ca-pub-4624647370340615';
const CONTACT_EMAIL = 'smitbarot106@gmail.com';

const esc = s => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const catOf = id => CATEGORIES.find(c => c.id === id);
const toolOf = id => TOOLS.find(t => t.id === id);
const guideOf = slug => GUIDES.find(g => g.slug === slug);
const write = (rel, text) => {
  const f = path.join(ROOT, rel);
  fs.mkdirSync(path.dirname(f), { recursive: true });
  fs.writeFileSync(f, text);
};
const assetV = file => crypto.createHash('sha1').update(fs.readFileSync(path.join(ROOT, file))).digest('hex').slice(0, 8);
const asset = file => `/${file}?v=${assetV(file)}`;
const catPage = c => (CATEGORY_CONTENT[c.id] ? `/${CATEGORY_CONTENT[c.id].slug}` : null);

/* Turn {{tool-id}} and {{guide:slug}} in written content into links. */
function rich(text) {
  return esc(text)
    .replace(/\{\{guide:([a-z0-9-]+)\}\}/g, (m, s) => { const g = guideOf(s); if (!g) throw new Error('Unknown guide ' + s); return `<a href="/guides/${s}">${esc(g.h1)}</a>`; })
    .replace(/\{\{([a-z0-9-]+)\}\}/g, (m, id) => { const t = toolOf(id); if (!t) throw new Error('Unknown tool ' + id); return `<a href="/${id}">${esc(t.name)}</a>`; });
}

/* ---------- brand ---------- */
const MARK = '<svg class="mark" viewBox="0 0 32 32" aria-hidden="true" focusable="false"><rect width="32" height="32" rx="8" fill="currentColor"/><g fill="#fff"><rect x="7" y="7" width="8" height="8" rx="2"/><rect x="17" y="7" width="8" height="8" rx="2" opacity=".6"/><rect x="7" y="17" width="8" height="8" rx="2" opacity=".6"/><rect x="17" y="17" width="8" height="8" rx="2"/></g></svg>';
const FAVICON = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32"><rect width="32" height="32" rx="8" fill="#1d4ed8"/><g fill="#fff"><rect x="7" y="7" width="8" height="8" rx="2"/><rect x="17" y="7" width="8" height="8" rx="2" opacity=".6"/><rect x="7" y="17" width="8" height="8" rx="2" opacity=".6"/><rect x="17" y="17" width="8" height="8" rx="2"/></g></svg>';
write('favicon.svg', FAVICON);
write('og-image.svg', `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630" viewBox="0 0 1200 630">
<rect width="1200" height="630" fill="#0f172a"/>
<g transform="translate(96 96) scale(3.5)"><rect width="32" height="32" rx="8" fill="#3b6df0"/><g fill="#fff"><rect x="7" y="7" width="8" height="8" rx="2"/><rect x="17" y="7" width="8" height="8" rx="2" opacity=".6"/><rect x="7" y="17" width="8" height="8" rx="2" opacity=".6"/><rect x="17" y="17" width="8" height="8" rx="2"/></g></g>
<text x="96" y="330" font-family="Helvetica, Arial, sans-serif" font-weight="700" font-size="92" fill="#ffffff">AllTools Hub</text>
<text x="96" y="412" font-family="Helvetica, Arial, sans-serif" font-size="40" fill="#cbd5e1">Free online tools that run in your browser</text>
<text x="96" y="500" font-family="Helvetica, Arial, sans-serif" font-size="30" fill="#94a3b8">${TOOLS.length} tools  /  No sign-up  /  Private by design</text>
</svg>`);

const ICON = {
  search: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true" focusable="false"><circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/></svg>',
  menu: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true" focusable="false"><path d="M4 7h16M4 12h16M4 17h16"/></svg>',
  theme: '<svg class="i-moon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><path d="M20 14.5A8.5 8.5 0 0 1 9.5 4 8.5 8.5 0 1 0 20 14.5z"/></svg><svg class="i-sun" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true" focusable="false"><circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M2 12h2M20 12h2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/></svg>',
  lock: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><rect x="5" y="11" width="14" height="9" rx="2"/><path d="M8 11V8a4 4 0 0 1 8 0v3"/></svg>',
  bolt: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><path d="M13 2 4 14h7l-1 8 9-12h-7z"/></svg>',
  user: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><circle cx="12" cy="8" r="4"/><path d="M4 21a8 8 0 0 1 16 0"/></svg>'
};

/* ---------- page shell ---------- */
function layout(o) {
  const url = SITE + o.path;
  const ld = o.ld ? o.ld.map(x => `\n<script type="application/ld+json">${JSON.stringify(x).replace(/</g, '\\u003c')}</script>`).join('') : '';
  const nav = [['All tools', '/#all-tools'], ['Calculators', '/calculators'], ['Developer tools', '/developer-tools'], ['Guides', '/guides'], ['About', '/about']]
    .map(([n, h]) => `<a href="${h}"${o.nav === h ? ' aria-current="page"' : ''}>${n}</a>`).join('');
  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${esc(o.title)}</title>
<meta name="description" content="${esc(o.desc)}">
<link rel="canonical" href="${url}">
<meta name="color-scheme" content="light dark">
<meta name="theme-color" content="#ffffff" media="(prefers-color-scheme: light)">
<meta name="theme-color" content="#0b1020" media="(prefers-color-scheme: dark)">
<meta property="og:type" content="${o.ogType || 'website'}">
<meta property="og:site_name" content="AllTools Hub">
<meta property="og:locale" content="en_US">
<meta property="og:title" content="${esc(o.title)}">
<meta property="og:description" content="${esc(o.desc)}">
<meta property="og:url" content="${url}">
<meta property="og:image" content="${SITE}/og-image.png">
<meta property="og:image:type" content="image/png">
<meta property="og:image:width" content="1200">
<meta property="og:image:height" content="630">
<meta property="og:image:alt" content="AllTools Hub: free online tools that run in your browser">
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:title" content="${esc(o.title)}">
<meta name="twitter:description" content="${esc(o.desc)}">
<meta name="twitter:image" content="${SITE}/og-image.png">${o.noindex ? '\n<meta name="robots" content="noindex">' : ''}${o.extraHead ? '\n' + o.extraHead : ''}
<link rel="icon" href="/favicon.svg" type="image/svg+xml">
<link rel="apple-touch-icon" href="/apple-touch-icon.png">
<link rel="stylesheet" href="${asset('style.css')}">
<script src="${asset('site.js')}"></script>
<script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${ADSENSE_CLIENT}" crossorigin="anonymous"></script>${ld}
</head>
<body${o.bodyAttr || ''}>
<a class="skip" href="#main">Skip to content</a>
<header class="site-header"><div class="wrap bar">
<a class="brand" href="/">${MARK}<span>AllTools Hub</span></a>
<nav class="nav" id="site-nav" aria-label="Main">${nav}
<form class="nav-search" action="/" method="get" role="search"><label class="sr" for="nav-q">Search tools</label><input id="nav-q" name="q" type="search" placeholder="Search tools" autocomplete="off"><button type="submit" aria-label="Search">${ICON.search}</button></form></nav>
<button class="icon-btn" id="theme-toggle" type="button" aria-label="Switch between light and dark mode" aria-pressed="false">${ICON.theme}</button>
<button class="icon-btn menu-btn" id="menu-toggle" type="button" aria-label="Open menu" aria-expanded="false" aria-controls="site-nav">${ICON.menu}</button>
</div></header>
<main id="main">
${o.body}
</main>
<footer class="site-footer"><div class="wrap">
<div class="foot">
<div class="foot-about"><a class="brand" href="/">${MARK}<span>AllTools Hub</span></a><p>Free online tools that work in your browser. What you type is not sent to our servers.</p></div>
<div><h2>Tools</h2><ul>${CATEGORIES.filter(catPage).map(c => `<li><a href="${catPage(c)}">${esc(c.name)}</a></li>`).join('')}<li><a href="/#all-tools">All ${TOOLS.length} tools</a></li></ul></div>
<div><h2>Guides</h2><ul>${GUIDES.map(g => `<li><a href="/guides/${g.slug}">${esc(g.h1)}</a></li>`).join('')}</ul></div>
<div><h2>Site</h2><ul><li><a href="/about">About</a></li><li><a href="/contact">Contact</a></li><li><a href="/privacy">Privacy Policy</a></li><li><a href="/terms">Terms and Conditions</a></li><li><a href="/disclaimer">Disclaimer</a></li></ul></div>
</div>
<p class="copy">&copy; 2026 AllTools Hub. All rights reserved.</p>
</div></footer>
${o.scripts || ''}
</body>
</html>
`;
}

const crumbs = items => `<nav class="crumbs" aria-label="Breadcrumb"><ol>${items.map((i, n) => n === items.length - 1 ? `<li aria-current="page">${esc(i[0])}</li>` : `<li><a href="${i[1]}">${esc(i[0])}</a></li>`).join('')}</ol></nav>`;
const crumbLd = items => ({ '@context': 'https://schema.org', '@type': 'BreadcrumbList', itemListElement: items.map((i, n) => ({ '@type': 'ListItem', position: n + 1, name: i[0], item: SITE + i[1] })) });

const kw = t => (t.keywords || []).join(' ');
const card = t => `<li data-name="${esc(t.name.toLowerCase())}" data-kw="${esc(kw(t).toLowerCase())}" data-desc="${esc((t.desc + ' ' + catOf(t.cat).name).toLowerCase())}"><a class="card" href="/${t.id}"><span class="ico" aria-hidden="true">${esc(t.icon)}</span><span class="card-title">${esc(t.name)}</span><span class="card-desc">${esc(t.desc)}</span></a></li>`;

/* ---------- home ---------- */
function home() {
  const popular = TOOLS.filter(t => t.popular || t.featured).slice(0, 6);
  const body = `
<section class="hero"><div class="wrap">
<p class="eyebrow">${TOOLS.length} free tools &middot; No sign-up &middot; Private by design</p>
<h1>Free online tools that work in your browser</h1>
<p class="lead">Count words, work out a loan, format JSON or make a strong password. Every tool runs on your device, so what you type is not uploaded.</p>
<form class="search" role="search" action="/" method="get" id="search-form">
${ICON.search}
<label class="sr" for="q">Search ${TOOLS.length} tools</label>
<input id="q" name="q" type="search" placeholder="Search ${TOOLS.length} tools, for example &quot;loan&quot; or &quot;json&quot;" autocomplete="off" enterkeyhint="search">
<button type="button" class="q-clear" id="q-clear" aria-label="Clear search" hidden>&times;</button>
</form>
<p class="chips" id="categories"><span>Browse:</span>${CATEGORIES.map(c => catPage(c) ? `<a href="${catPage(c)}">${esc(c.name)}</a>` : `<a href="#cat-${c.id}">${esc(c.name)}</a>`).join('')}</p>
</div></section>

<div class="wrap" id="results" hidden>
<section class="block" aria-labelledby="results-title"><div class="block-head"><h2 id="results-title">Search results</h2><p id="results-count" role="status" aria-live="polite"></p></div>
<ul class="grid" id="results-grid"></ul>
<div class="empty" id="results-empty" hidden><p><strong>No tool matches your search.</strong></p><p>Try a simpler word such as <a href="/?q=text">text</a>, <a href="/?q=loan">loan</a> or <a href="/?q=convert">convert</a>, or browse the full list below.</p><p><a class="btn" href="/#all-tools" id="browse-all">Browse all tools</a></p></div>
</section></div>

<div id="browse"><div class="wrap">
<section class="block" aria-labelledby="popular-title"><div class="block-head"><h2 id="popular-title">Popular tools</h2></div>
<ul class="grid">${popular.map(card).join('')}</ul></section>

<section class="block" aria-labelledby="cats-title"><div class="block-head"><h2 id="cats-title">Browse by category</h2></div>
<ul class="grid grid-cats">${CATEGORIES.filter(catPage).map(c => `<li><a class="card cat-card" href="${catPage(c)}"><span class="card-title">${esc(c.name)}</span><span class="card-desc">${esc(c.blurb)}</span><span class="count">${TOOLS.filter(t => t.cat === c.id).length} tools</span></a></li>`).join('')}</ul></section>

<section class="block" id="all-tools" aria-labelledby="all-title"><div class="block-head"><h2 id="all-title">All tools</h2><p>${TOOLS.length} tools in ${CATEGORIES.length} categories</p></div>
${CATEGORIES.map(c => {
  const list = TOOLS.filter(t => t.cat === c.id);
  return list.length ? `<div class="cat-row" id="cat-${c.id}"><h3>${catPage(c) ? `<a href="${catPage(c)}">${esc(c.name)}</a>` : esc(c.name)}</h3><ul class="grid">${list.map(card).join('')}</ul></div>` : '';
}).join('\n')}
</section>

<section class="block" aria-labelledby="guides-title"><div class="block-head"><h2 id="guides-title">Guides</h2><p><a href="/guides">All guides</a></p></div>
<ul class="grid">${GUIDES.map(g => `<li><a class="card" href="/guides/${g.slug}"><span class="card-title">${esc(g.h1)}</span><span class="card-desc">${esc(g.desc)}</span></a></li>`).join('')}</ul></section>

<section class="block trust" aria-labelledby="why-title"><h2 class="sr" id="why-title">Why AllTools Hub</h2>
<ul class="trust-grid">
<li><span class="t-ico">${ICON.lock}</span><h3>Private by design</h3><p>Tools run in your browser. The text and numbers you enter are not uploaded or saved.</p></li>
<li><span class="t-ico">${ICON.bolt}</span><h3>Fast and simple</h3><p>No installs, no pop-ups to dismiss and no waiting for a server to respond.</p></li>
<li><span class="t-ico">${ICON.user}</span><h3>No account needed</h3><p>Open a tool and use it. Every tool explains its formula and limits so you can trust the result.</p></li>
</ul></section>
</div></div>`;
  write('index.html', layout({
    title: 'AllTools Hub - Free Online Tools for Text, Calculators and Developers',
    desc: `Free online tools that run in your browser: word counter, loan and GST calculators, JSON formatter, password generator, unit converters and more. No sign-up.`,
    path: '/', nav: '/', body,
    extraHead: '<meta name="google-site-verification" content="IJoQ3jtkGflEm8lZiyXrhtS3oLgVRDWqT22zVBc_IsQ" />',
    scripts: `<script src="${asset('home.js')}" defer></script>`,
    ld: [{
      '@context': 'https://schema.org', '@type': 'WebSite', name: 'AllTools Hub', url: SITE + '/',
      description: 'Free online tools that run in your browser: word counter, loan and GST calculators, JSON formatter, password generator, unit converters and more.',
      potentialAction: { '@type': 'SearchAction', target: { '@type': 'EntryPoint', urlTemplate: SITE + '/?q={search_term_string}' }, 'query-input': 'required name=search_term_string' }
    }]
  }));
}

/* ---------- tool form (rendered in HTML so the page does not jump when scripts load) ---------- */
function fieldHtml(f) {
  const id = 'f-' + f.name;
  if (f.type === 'checkbox') return `<div class="field check"><label for="${id}"><input type="checkbox" id="${id}"${f.default ? ' checked' : ''}><span>${esc(f.label)}</span></label></div>`;
  const help = f.help ? `<span class="help" id="${id}-help">${esc(f.help)}</span>` : '';
  const desc = f.help ? ` aria-describedby="${id}-help"` : '';
  let control;
  if (f.type === 'textarea') control = `<textarea id="${id}" rows="${f.rows || 6}" spellcheck="false"${f.placeholder ? ` placeholder="${esc(f.placeholder)}"` : ''}${desc}>${esc(f.default != null ? f.default : '')}</textarea>`;
  else if (f.type === 'select') control = `<select id="${id}"${desc}>${f.options.map(o => `<option value="${esc(o[0])}"${String(o[0]) === String(f.default) ? ' selected' : ''}>${esc(o[1])}</option>`).join('')}</select>`;
  else {
    const attrs = ['min', 'max', 'step'].filter(a => f[a] != null).map(a => ` ${a}="${esc(f[a])}"`).join('');
    control = `<input type="${f.type}" id="${id}"${attrs}${f.type === 'number' ? ' inputmode="decimal"' : ''}${f.placeholder ? ` placeholder="${esc(f.placeholder)}"` : ''}${f.default != null ? ` value="${esc(f.default)}"` : ''}${desc}>`;
  }
  return `<div class="field${f.type === 'textarea' ? ' full' : ''}"><label for="${id}">${esc(f.label)}</label>${control}${help}</div>`;
}
function toolForm(t) {
  return `<form class="tool-form" id="tool-form" novalidate autocomplete="off">
<div class="fields">${t.fields.map(fieldHtml).join('')}</div>
<div class="actions">${t.live ? '' : `<button type="submit" class="btn" id="btn-run">${esc(t.action || 'Calculate')}</button>`}<button type="button" class="btn ghost" id="btn-copy"${t.live ? '' : ' hidden'}>${t.live ? 'Copy results' : 'Copy'}</button>${t.download ? '<button type="button" class="btn ghost" id="btn-download" hidden>Download</button>' : ''}<button type="button" class="btn ghost" id="btn-reset">Reset</button></div>
</form>
<div class="msg" id="msg" role="status" aria-live="polite" hidden></div>
<div class="placeholder" id="placeholder"${t.live ? ' hidden' : ''}><p>${t.live ? '' : 'Your result will appear here after you press <strong>' + esc(t.action || 'Calculate') + '</strong>.'}</p></div>
<div class="results" id="results" hidden><dl class="stats" id="stats"></dl><div class="out-box" id="out-box" hidden><label for="out" class="out-label" id="out-label">Result</label><textarea id="out" class="out" readonly rows="6" spellcheck="false"></textarea></div></div>`;
}

/* ---------- tool pages ---------- */
function toolPage(t) {
  const cat = catOf(t.cat), c = TOOL_CONTENT[t.id];
  if (!c) throw new Error('Missing content for ' + t.id);
  const same = TOOLS.filter(x => x.cat === t.cat && x.id !== t.id);
  const others = TOOLS.filter(x => x.cat !== t.cat && x.id !== t.id).sort((a, b) => (b.popular ? 1 : 0) - (a.popular ? 1 : 0));
  const related = same.concat(others).slice(0, 4);
  const trail = [['Home', '/']].concat(catPage(cat) ? [[cat.name, catPage(cat)]] : [], [[t.name, '/' + t.id]]);
  const guide = c.guide ? guideOf(c.guide) : null;
  const list = a => `<ul>${a.map(x => `<li>${rich(x)}</li>`).join('')}</ul>`;
  const body = `
<div class="wrap">
${crumbs(trail)}
<header class="tool-head"><h1>${esc(t.name)}</h1><p class="lead">${esc(t.intro)}</p></header>
<div class="tool-layout">
<div class="tool-main"><div class="tool-card" id="tool-root" data-tool="${t.id}">${toolForm(t)}<noscript><p class="msg err">This tool needs JavaScript. Please turn it on in your browser settings and reload the page.</p></noscript></div>
${t.note ? `<p class="tool-note"><strong>Please note:</strong> ${esc(t.note)}</p>` : ''}</div>
<aside class="tool-side" aria-label="Related tools"><section><h2>Related tools</h2><ul class="plain-list">${related.map(x => `<li><a href="/${x.id}">${esc(x.name)}</a></li>`).join('')}</ul></section>
<section><h2>Your privacy</h2><p>This tool works inside your browser. What you type is not uploaded, saved or shared.</p></section></aside>
</div>

<article class="tool-content prose">
<section><h2>About the ${esc(t.name)}</h2>${c.about.map(p => `<p>${rich(p)}</p>`).join('')}</section>
<section><h2>How to use it</h2><ol class="steps">${t.steps.map(s => `<li>${esc(s)}</li>`).join('')}</ol></section>
${c.formula ? `<section><h2>How it works</h2>${c.formula.length > 1 ? `<ul class="formulas">${c.formula.map(x => `<li>${rich(x)}</li>`).join('')}</ul>` : `<p>${rich(c.formula[0])}</p>`}</section>` : ''}
${c.example ? `<section><h2>${esc(c.example.title)}</h2><p class="callout">${rich(c.example.text)}</p></section>` : ''}
<section><h2>Common uses</h2>${list(c.uses)}</section>
<section><h2>Limitations</h2>${list(c.limits)}</section>
<section class="faq"><h2>Frequently asked questions</h2>${c.faqs.map(f => `<details><summary>${esc(f[0])}</summary><p>${rich(f[1])}</p></details>`).join('')}</section>
${guide ? `<section><h2>Learn more</h2><p>Read the guide <a href="/guides/${guide.slug}">${esc(guide.h1)}</a> for a step-by-step explanation.</p></section>` : ''}
<section><h2>More tools</h2><ul class="grid grid-sm">${related.map(card).join('')}</ul></section>
</article>
</div>`;
  const title = `${t.name} - Free Online Tool | AllTools Hub`;
  const desc = `${t.desc} Free, no sign-up, and it works in your browser.`;
  write(`${t.id}.html`, layout({
    title: title.length > 62 ? `${t.name} - Free Online Tool` : title, desc, path: '/' + t.id, body, bodyAttr: ` data-tool="${t.id}"`, nav: catPage(cat) || '/',
    scripts: `<script src="${asset('tools.js')}" defer></script>\n<script src="${asset('tool.js')}" defer></script>`,
    ld: [
      { '@context': 'https://schema.org', '@type': 'WebApplication', name: t.name, description: desc, url: `${SITE}/${t.id}`, applicationCategory: 'UtilityApplication', operatingSystem: 'Any', offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' }, browserRequirements: 'Requires JavaScript' },
      crumbLd(trail)
    ]
  }));
}

/* ---------- category pages ---------- */
function categoryPage(cat) {
  const c = CATEGORY_CONTENT[cat.id];
  if (!c) return;
  const list = TOOLS.filter(t => t.cat === cat.id);
  const guides = GUIDES.filter(g => g.tools.some(id => list.some(t => t.id === id)));
  const trail = [['Home', '/'], [c.title, '/' + c.slug]];
  const body = `<div class="wrap">${crumbs(trail)}
<header class="tool-head"><h1>${esc(c.title)}</h1>${c.intro.map((p, i) => `<p${i === 0 ? ' class="lead"' : ''}>${esc(p)}</p>`).join('')}</header>
<section class="block" aria-labelledby="cat-tools"><div class="block-head"><h2 id="cat-tools">${list.length} tools</h2></div><ul class="grid">${list.map(card).join('')}</ul></section>
${guides.length ? `<section class="block" aria-labelledby="cat-guides"><div class="block-head"><h2 id="cat-guides">Related guides</h2></div><ul class="grid">${guides.map(g => `<li><a class="card" href="/guides/${g.slug}"><span class="card-title">${esc(g.h1)}</span><span class="card-desc">${esc(g.desc)}</span></a></li>`).join('')}</ul></section>` : ''}
<section class="block"><div class="block-head"><h2>Other categories</h2></div><p class="chips">${CATEGORIES.filter(x => x.id !== cat.id && catPage(x)).map(x => `<a href="${catPage(x)}">${esc(x.name)}</a>`).join('')}</p></section>
</div>`;
  write(`${c.slug}.html`, layout({
    title: `${c.title} | AllTools Hub`, desc: c.desc, path: '/' + c.slug, body, nav: '/' + c.slug,
    ld: [{ '@context': 'https://schema.org', '@type': 'CollectionPage', name: c.title, description: c.desc, url: SITE + '/' + c.slug, mainEntity: { '@type': 'ItemList', itemListElement: list.map((t, i) => ({ '@type': 'ListItem', position: i + 1, url: `${SITE}/${t.id}`, name: t.name })) } }, crumbLd(trail)]
  }));
}

/* ---------- guides ---------- */
function guidesIndex() {
  const trail = [['Home', '/'], ['Guides', '/guides']];
  const body = `<div class="wrap">${crumbs(trail)}
<header class="tool-head"><h1>Guides</h1><p class="lead">Short, practical explanations of the maths and ideas behind our tools, with formulas and worked examples you can check yourself.</p></header>
<ul class="grid">${GUIDES.map(g => `<li><a class="card" href="/guides/${g.slug}"><span class="card-title">${esc(g.h1)}</span><span class="card-desc">${esc(g.desc)}</span></a></li>`).join('')}</ul></div>`;
  write('guides.html', layout({
    title: 'Guides - Formulas, Examples and Tips | AllTools Hub', desc: 'Plain-language guides to GST, loan EMI and password strength, with formulas and worked examples.', path: '/guides', body, nav: '/guides',
    ld: [{ '@context': 'https://schema.org', '@type': 'CollectionPage', name: 'AllTools Hub Guides', url: SITE + '/guides' }, crumbLd(trail)]
  }));
}

function guidePage(g) {
  const trail = [['Home', '/'], ['Guides', '/guides'], [g.h1, '/guides/' + g.slug]];
  const sec = s => `<section><h2>${esc(s.h)}</h2>${(s.p || []).map(p => `<p>${rich(p)}</p>`).join('')}${s.formula ? `<p class="formula">${s.formula.map(esc).join('<br>')}</p>` : ''}${s.example ? `<p class="callout">${rich(s.example)}</p>` : ''}${s.list ? `<ul>${s.list.map(x => `<li>${rich(x)}</li>`).join('')}</ul>` : ''}</section>`;
  const body = `<div class="wrap">${crumbs(trail)}
<article class="prose guide"><header><h1>${esc(g.h1)}</h1><p class="updated">Last updated: ${esc(new Date(g.updated + 'T00:00:00Z').toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC' }))}</p></header>
${g.sections.map(sec).join('\n')}
<section><h2>Try the tools</h2><ul class="grid grid-sm">${g.tools.map(id => card(toolOf(id))).join('')}</ul></section>
<section class="faq"><h2>Frequently asked questions</h2>${g.faqs.map(f => `<details><summary>${esc(f[0])}</summary><p>${rich(f[1])}</p></details>`).join('')}</section>
<section><h2>More guides</h2><ul>${GUIDES.filter(x => x.slug !== g.slug).map(x => `<li><a href="/guides/${x.slug}">${esc(x.h1)}</a></li>`).join('')}</ul></section>
</article></div>`;
  write(`guides/${g.slug}.html`, layout({
    title: g.title, desc: g.desc, path: '/guides/' + g.slug, body, nav: '/guides', ogType: 'article',
    ld: [{ '@context': 'https://schema.org', '@type': 'Article', headline: g.h1, description: g.desc, mainEntityOfPage: `${SITE}/guides/${g.slug}`, dateModified: g.updated, datePublished: g.updated, image: `${SITE}/og-image.png`, publisher: { '@type': 'Organization', name: 'AllTools Hub', url: SITE + '/' } }, crumbLd(trail)]
  }));
}

/* ---------- information pages ---------- */
const PAGES = {
  about: {
    title: 'About AllTools Hub', desc: 'AllTools Hub offers free online tools that run in your browser. Learn what we build, how the tools are checked and how we keep your data private.',
    body: `<h1>About AllTools Hub</h1>
<p>AllTools Hub is a collection of free online tools for everyday jobs: counting words, working out a loan, formatting data, converting units and more. Each tool is built to be clear for a first-time visitor and to show how its result is calculated.</p>
<h2>How we work</h2>
<ul><li><strong>Simple.</strong> Every tool explains what it does, what to enter and what you will get.</li>
<li><strong>Private.</strong> Our tools run in your browser. The text and numbers you enter are not uploaded to our servers.</li>
<li><strong>Transparent.</strong> Each tool page shows the formula behind the result, a worked example and the limits of the tool.</li>
<li><strong>Free.</strong> You do not need an account to use any tool.</li></ul>
<h2>What is available today</h2>
<p>There are currently ${TOOLS.length} tools in ${CATEGORIES.length} categories: <a href="/text-tools">text tools</a>, <a href="/calculators">calculators</a>, <a href="/developer-tools">developer tools</a>, <a href="/unit-converters">unit converters</a> and other everyday tools. We also publish short <a href="/guides">guides</a> that explain the maths behind the calculators. Every tool is covered by automated tests that check normal, empty, invalid and edge-case inputs.</p>
<h2>How we make money</h2>
<p>The site is free to use. We may show advertising from Google AdSense in the future, which would help pay for the work. Advertising never changes a tool&apos;s result. See the <a href="/privacy">Privacy Policy</a> for how advertising and cookies are handled.</p>
<h2>Tell us what you need</h2>
<p>Found a mistake, or want a new tool? Please visit our <a href="/contact">contact page</a>.</p>`
  },
  contact: {
    title: 'Contact AllTools Hub', desc: 'Report a bug, ask a question, suggest a new tool or discuss privacy matters for AllTools Hub.',
    body: `<h1>Contact us</h1>
<p>We would like to hear from you. You can contact us to report a bug, ask a question, suggest a new tool or discuss privacy matters.</p>
<h2>How to reach us</h2>
<ul>
<li><strong>Email:</strong> For general inquiries, feedback or privacy questions, write to us at <a href="mailto:${CONTACT_EMAIL}">${CONTACT_EMAIL}</a>.</li>
<li><strong>GitHub Issues:</strong> For bug reports, calculation errors or technical suggestions, open an issue on our project tracker: <a href="https://github.com/smitbarot106-lang/AllTools-Hub/issues" rel="noopener" target="_blank">github.com/smitbarot106-lang/AllTools-Hub/issues</a> (requires a free GitHub account).</li>
</ul>
<h2>What to include in a bug report</h2>
<ul>
<li>The tool name and page address (URL).</li>
<li>What inputs you entered, what result you expected and what happened instead.</li>
<li>Your device, operating system and browser version, if known.</li>
</ul>
<p>Please do not send passwords, private documents or sensitive personal information.</p>`
  },
  privacy: {
    title: 'Privacy Policy - AllTools Hub', desc: 'How AllTools Hub handles your data. Our tools run in your browser, inputs stay on your device, and advertising disclosures.',
    body: `<h1>Privacy Policy</h1><p class="updated">Last updated: 24 November 2026</p>
<p>This page explains, in plain language, how AllTools Hub handles information when you visit our website and use our free online tools.</p>
<h2>What you enter into our tools</h2>
<p>AllTools Hub is designed with privacy by default. Every tool on this website runs directly inside your web browser using client-side JavaScript.</p>
<ul>
<li>The text, numbers, calculations and settings you enter are processed locally in your device&apos;s memory.</li>
<li>We do not transmit, upload, log or store your tool inputs or calculation results on our servers or with any third party.</li>
<li>When you copy results to your clipboard or download a generated file, that action takes place entirely on your device.</li>
</ul>
<h2>Google AdSense and advertising cookies</h2>
<p>We have integrated Google AdSense code on our website for account verification and site review.</p>
<ul>
<li><strong>Current status:</strong> AllTools Hub is under review by Google AdSense. Advertisements are not actively being served on the website at this time.</li>
<li><strong>Prospective ad serving and cookies:</strong> Once our website is approved and advertising begins, third-party vendors, including Google, will use cookies to serve ads based on your prior visits to this website or other websites on the internet.</li>
<li><strong>Personalized advertising:</strong> Google&apos;s use of advertising cookies enables it and its partners to serve ads to you based on your visit to AllTools Hub and/or other sites across the internet.</li>
<li><strong>Opt-out choices:</strong> You can opt out of personalized advertising at any time by visiting <a href="https://adssettings.google.com/" rel="noopener" target="_blank">Google Ads Settings</a>. You can also opt out of third-party advertising cookies by visiting <a href="https://www.aboutads.info/choices/" rel="noopener" target="_blank">aboutads.info/choices</a> or <a href="https://www.youronlinechoices.com/" rel="noopener" target="_blank">youronlinechoices.com</a>.</li>
<li><strong>Visitors in the EEA, UK and Switzerland:</strong> where required by law, we will ask for your consent before advertising cookies are used.</li>
</ul>
<h2>Web analytics</h2>
<p>When the site is served through Cloudflare Pages, Cloudflare Web Analytics may be used to understand website traffic, page views and performance metrics (such as page load speeds). Cloudflare Web Analytics is privacy-first: it measures non-personal aggregated website usage without using cookies, without using fingerprinting, and without collecting personal data across websites. For more details, please see the <a href="https://www.cloudflare.com/privacypolicy/" rel="noopener" target="_blank">Cloudflare Privacy Policy</a>.</p>
<h2>Local storage on your device</h2>
<p>We do not use cookies for site functionality. Our website uses your browser&apos;s local storage (<code>localStorage</code>) solely to remember your preferred theme (<code>light</code> or <code>dark</code> mode). This setting stays on your device, contains no personal information, and can be cleared at any time in your browser settings.</p>
<h2>Hosting and security</h2>
<p>This website is hosted on Cloudflare Pages and may also be served through Vercel. As hosting providers and content delivery networks, they process standard technical network connection data (such as visitor IP addresses, browser user agent strings and requested URLs) to route traffic and protect the site against attacks. We do not maintain our own access logs. For details, please see the <a href="https://www.cloudflare.com/privacypolicy/" rel="noopener" target="_blank">Cloudflare Privacy Policy</a> and the <a href="https://vercel.com/legal/privacy-policy" rel="noopener" target="_blank">Vercel Privacy Policy</a>.</p>
<h2>External links</h2>
<p>Our website links to external platforms such as GitHub. We are not responsible for the privacy practices of external websites.</p>
<h2>Changes to this policy</h2>
<p>If our advertising status changes or if we introduce new features, we will update this page and revise the date above.</p>
<h2>Questions</h2>
<p>If you have any questions about this privacy policy, please email us at <a href="mailto:${CONTACT_EMAIL}">${CONTACT_EMAIL}</a> or visit our <a href="/contact">contact page</a>.</p>`
  },
  terms: {
    title: 'Terms and Conditions - AllTools Hub', desc: 'The terms for using AllTools Hub and its free online tools.',
    body: `<h1>Terms and Conditions</h1><p class="updated">Last updated: 24 November 2026</p>
<p>By using AllTools Hub, you agree to these terms. If you do not agree, please do not use the website.</p>
<h2>Use of the website</h2>
<p>You may use our tools for personal and business purposes. Please do not misuse the website: do not try to break it, overload it, or use it to do anything illegal.</p>
<h2>No guarantee</h2>
<p>We work hard to make every tool correct, but the website and its tools are provided &quot;as is&quot;, without any promise that they are error-free, always available or right for your purpose. Please check important results yourself before you rely on them.</p>
<h2>Limit of responsibility</h2>
<p>To the extent allowed by law, AllTools Hub is not responsible for any loss or damage that comes from using the website or relying on a result from a tool.</p>
<h2>Our content</h2>
<p>The design, text and code of this website belong to AllTools Hub. Please do not copy the website as a whole and present it as your own. The text and data you enter into a tool remain yours.</p>
<h2>Third-party services</h2>
<p>AllTools Hub includes links to external websites and integrates third-party services such as Google AdSense. Google AdSense code is installed on the site for account verification; advertisements are not actively served while site approval is pending. When you follow external links (such as to GitHub) or interact with third-party features, your use is subject to the terms and privacy policies of those third-party providers.</p>
<h2>Changes</h2>
<p>We may change the website, the tools or these terms at any time. The date above shows the latest update.</p>
<h2>Contact</h2>
<p>Questions about these terms? Please use our <a href="/contact">contact page</a>.</p>`
  },
  disclaimer: {
    title: 'Disclaimer - AllTools Hub', desc: 'Important notes about the calculators and tools on AllTools Hub. Results are for information only.',
    body: `<h1>Disclaimer</h1><p class="updated">Last updated: 24 November 2026</p>
<p>The tools on AllTools Hub give general information and estimates. They are not professional advice.</p>
<h2>Financial and tax calculators</h2>
<p>The GST, discount, percentage and EMI calculators give estimates. Real taxes, bank fees and loan terms can differ. Please confirm figures with your bank, tax adviser or the seller before you make a decision.</p>
<h2>Health calculators</h2>
<p>The BMI calculator is a screening number for adults. It is not a medical diagnosis. Please talk to a doctor or another qualified health professional about your health.</p>
<h2>Security tools</h2>
<p>The password generator creates random passwords in your browser. You are responsible for keeping your passwords safe. Base64 is an encoding, not encryption, and does not protect secret information.</p>
<h2>Accuracy</h2>
<p>We test our tools, but mistakes can still happen. If you find one, please tell us on the <a href="/contact">contact page</a>.</p>`
  }
};

function infoPage(name) {
  const p = PAGES[name];
  write(`${name}.html`, layout({
    title: p.title, desc: p.desc, path: '/' + name, nav: '/' + name,
    body: `<div class="wrap"><div class="prose">${p.body}</div></div>`,
    ld: name === 'about' ? [{ '@context': 'https://schema.org', '@type': 'AboutPage', name: p.title, url: SITE + '/about' }] : null
  }));
}

function notFound() {
  const popular = TOOLS.filter(t => t.popular).slice(0, 4);
  write('404.html', layout({
    title: 'Page not found - AllTools Hub', desc: 'This page could not be found. Search AllTools Hub or open one of the popular free online tools.', path: '/404', noindex: true,
    body: `<div class="wrap"><div class="prose notfound"><p class="eyebrow">Error 404</p><h1>Page not found</h1><p>The page you are looking for does not exist or has moved. Try searching, or open one of the popular tools below.</p>
<form class="search" role="search" action="/" method="get">${ICON.search}<label class="sr" for="q404">Search tools</label><input id="q404" name="q" type="search" placeholder="Search tools" autocomplete="off"></form>
<ul class="grid grid-sm">${popular.map(card).join('')}</ul>
<p><a class="btn" href="/">Go to the homepage</a></p></div></div>`
  }));
}

/* ---------- SEO files and headers ---------- */
const SECURITY = {
  csp: base => [
    "default-src 'self'",
    `script-src 'self' https://pagead2.googlesyndication.com https://*.googlesyndication.com https://www.googletagservices.com https://partner.googleadservices.com https://googleads.g.doubleclick.net${base.script || ''}`,
    `connect-src 'self' https://pagead2.googlesyndication.com https://*.googlesyndication.com https://googleads.g.doubleclick.net https://*.google.com https://*.g.doubleclick.net${base.connect || ''}`,
    "img-src 'self' data: https://pagead2.googlesyndication.com https://*.googlesyndication.com https://googleads.g.doubleclick.net https://*.g.doubleclick.net https://*.google.com",
    'frame-src https://googleads.g.doubleclick.net https://tpc.googlesyndication.com https://*.googlesyndication.com https://*.google.com',
    "style-src 'self'", "font-src 'self'", "object-src 'none'", "base-uri 'self'", "form-action 'self'", "frame-ancestors 'none'"
  ].join('; '),
  common: [
    ['X-Content-Type-Options', 'nosniff'],
    ['X-Frame-Options', 'DENY'],
    ['Referrer-Policy', 'strict-origin-when-cross-origin'],
    ['Strict-Transport-Security', 'max-age=63072000'],
    ['Permissions-Policy', 'camera=(), microphone=(), geolocation=()']
  ]
};

function seoFiles() {
  const urls = [{ u: '/', p: '1.0' }]
    .concat(TOOLS.map(t => ({ u: '/' + t.id, p: '0.9' })))
    .concat(CATEGORIES.filter(catPage).map(c => ({ u: catPage(c), p: '0.7' })))
    .concat([{ u: '/guides', p: '0.6' }], GUIDES.map(g => ({ u: '/guides/' + g.slug, p: '0.6' })))
    .concat(Object.keys(PAGES).map(n => ({ u: '/' + n, p: n === 'about' || n === 'contact' ? '0.4' : '0.3' })));
  write('sitemap.xml', `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls.map(x => `  <url><loc>${SITE}${x.u === '/' ? '/' : x.u}</loc><lastmod>${BUILD_DATE}</lastmod></url>`).join('\n')}\n</urlset>\n`);
  write('robots.txt', `User-agent: *\nAllow: /\n\nSitemap: ${SITE}/sitemap.xml\n`);
  write('ads.txt', `google.com, pub-${ADSENSE_CLIENT.replace('ca-pub-', '')}, DIRECT, f08c47fec0942fa0\n`);

  const cfHeaders = SECURITY.common.concat([['Content-Security-Policy', SECURITY.csp({ script: ' https://static.cloudflareinsights.com', connect: ' https://cloudflareinsights.com' })]]);
  write('_headers', '/*\n' + cfHeaders.map(h => `  ${h[0]}: ${h[1]}`).join('\n') + '\n');

  const vercelHeaders = SECURITY.common.concat([['Content-Security-Policy', SECURITY.csp({})]]);
  write('vercel.json', JSON.stringify({
    cleanUrls: true,
    trailingSlash: false,
    headers: [
      { source: '/(.*)', headers: vercelHeaders.map(h => ({ key: h[0], value: h[1] })) },
      { source: '/(style.css|site.js|tool.js|tools.js|home.js)', has: [{ type: 'query', key: 'v' }], headers: [{ key: 'Cache-Control', value: 'public, max-age=31536000, immutable' }] }
    ]
  }, null, 2) + '\n');
}

home();
TOOLS.forEach(toolPage);
CATEGORIES.forEach(categoryPage);
guidesIndex();
GUIDES.forEach(guidePage);
Object.keys(PAGES).forEach(infoPage);
notFound();
seoFiles();
console.log('Built ' + (1 + TOOLS.length + CATEGORIES.filter(catPage).length + 1 + GUIDES.length + Object.keys(PAGES).length + 1) + ' pages for ' + TOOLS.length + ' tools (site ' + SITE + ').');
