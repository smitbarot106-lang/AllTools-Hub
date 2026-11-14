/* AllTools Hub - page generator.
   Run:  node build.js
   It reads tools.js and writes every HTML page, sitemap.xml, robots.txt and _headers. */
'use strict';
const fs = require('fs');
const path = require('path');
const { TOOLS, CATEGORIES } = require('./tools.js');

const ROOT = __dirname;
const SITE = 'https://alltools-hub.pages.dev';
const TODAY = '2026-11-14';
const esc = s => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const catOf = id => CATEGORIES.find(c => c.id === id);
const write = (rel, text) => {
  const f = path.join(ROOT, rel);
  fs.mkdirSync(path.dirname(f), { recursive: true });
  fs.writeFileSync(f, text);
};

const LOGO = '<svg viewBox="0 0 32 32" aria-hidden="true"><rect width="32" height="32" rx="8" fill="#0e5a48"/><rect x="7" y="7" width="8" height="8" rx="2" fill="#fff"/><rect x="17" y="7" width="8" height="8" rx="2" fill="#fff" opacity=".55"/><rect x="7" y="17" width="8" height="8" rx="2" fill="#fff" opacity=".55"/><rect x="17" y="17" width="8" height="8" rx="2" fill="#b08a2e"/></svg>';
write('favicon.svg', LOGO.replace('<svg ', '<svg xmlns="http://www.w3.org/2000/svg" ').replace(' aria-hidden="true"', ''));

const THEME_ICON = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><circle cx="12" cy="12" r="9"/><path d="M12 3v18" /><path d="M12 3a9 9 0 0 1 0 18z" fill="currentColor"/></svg>';

function layout(o) {
  const url = SITE + o.path;
  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${esc(o.title)}</title>
<meta name="description" content="${esc(o.desc)}">
<link rel="canonical" href="${url}">
<meta name="color-scheme" content="light dark">
<meta property="og:type" content="website">
<meta property="og:site_name" content="AllTools Hub">
<meta property="og:title" content="${esc(o.title)}">
<meta property="og:description" content="${esc(o.desc)}">
<meta property="og:url" content="${url}">
<meta name="twitter:card" content="summary">${o.noindex ? '\n<meta name="robots" content="noindex">' : ''}
<link rel="icon" href="/favicon.svg" type="image/svg+xml">
<link rel="stylesheet" href="/style.css">
<script src="/site.js"></script>
</head>
<body${o.bodyAttr || ''}>
<a class="skip" href="#main">Skip to content</a>
<header class="site-header"><div class="wrap bar">
<a class="brand" href="/">${LOGO}<span>AllTools Hub</span></a>
<nav class="nav" aria-label="Main"><a href="/#all-tools">All tools</a><a href="/about">About</a><a href="/contact">Contact</a></nav>
<button class="icon-btn" id="theme-toggle" type="button" aria-label="Switch between light and dark mode" aria-pressed="false">${THEME_ICON}</button>
</div></header>
<main id="main">
${o.body}
</main>
<footer class="site-footer"><div class="wrap">
<div class="foot">
<div><h2>AllTools Hub</h2><p>Free online tools that work in your browser. Nothing you type is sent to our servers.</p></div>
<div><h2>Tool categories</h2><ul>${CATEGORIES.map(c => `<li><a href="/#cat-${c.id}">${esc(c.name)}</a></li>`).join('')}</ul></div>
<div><h2>Company</h2><ul><li><a href="/about">About us</a></li><li><a href="/contact">Contact us</a></li></ul></div>
<div><h2>Legal</h2><ul><li><a href="/privacy">Privacy Policy</a></li><li><a href="/terms">Terms and Conditions</a></li><li><a href="/disclaimer">Disclaimer</a></li></ul></div>
</div>
<p class="copy">&copy; 2026 AllTools Hub. All rights reserved.</p>
</div></footer>
${o.scripts || ''}
</body>
</html>
`;
}

const card = t => `<a class="card" href="/${t.id}"><span class="ico" aria-hidden="true">${esc(t.icon)}</span><span class="card-t">${esc(t.name)}</span><span class="card-d">${esc(t.desc)}</span></a>`;

/* ---------- home ---------- */
function home() {
  const popular = TOOLS.filter(t => t.popular).slice(0, 6);
  const featured = TOOLS.filter(t => t.featured).slice(0, 3);
  const recent = TOOLS.map((t, i) => [t, i]).sort((a, b) => (b[0].added > a[0].added ? 1 : b[0].added < a[0].added ? -1 : a[1] - b[1])).map(x => x[0]).slice(0, 6);
  const body = `
<section class="hero"><div class="wrap">
<h1>Free online tools that run in your browser</h1>
<p class="lead">Count words, work out a loan, format JSON or make a strong password. No sign-up, and what you type stays on your device.</p>
<div class="search" role="search">
<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/></svg>
<input id="q" type="search" placeholder="Search ${TOOLS.length} tools, for example &quot;loan&quot; or &quot;json&quot;" aria-label="Search tools" autocomplete="off">
</div>
<ul class="cats" id="categories">${CATEGORIES.map(c => `<li><a href="#cat-${c.id}">${esc(c.name)}</a></li>`).join('')}</ul>
<ul class="trust"><li>Free to use</li><li>No sign-up</li><li>Your data stays in your browser</li></ul>
</div></section>

<div class="wrap" id="results" hidden>
<section class="section"><div class="section-head"><h2>Search results</h2><p id="results-count"></p></div><div class="grid" id="results-grid"></div></section>
</div>

<div id="browse">
<div class="wrap">
<section class="section"><div class="section-head"><h2>Featured tools</h2></div>
<div class="feature-grid">${featured.map(t => `<a class="feature" href="/${t.id}"><h3>${esc(t.name)}</h3><p>${esc(t.desc)}</p></a>`).join('')}</div></section>
<section class="section"><div class="section-head"><h2>Popular tools</h2></div><div class="grid">${popular.map(card).join('')}</div></section>
<section class="section"><div class="section-head"><h2>Recently added</h2></div><div class="grid">${recent.map(card).join('')}</div></section>
<section class="section" id="all-tools"><div class="section-head"><h2>All tools by category</h2><p>${TOOLS.length} tools</p></div>
${CATEGORIES.map(c => {
  const list = TOOLS.filter(t => t.cat === c.id);
  return list.length ? `<div class="cat-block" id="cat-${c.id}"><h3>${esc(c.name)} <span>${esc(c.blurb)}</span></h3><div class="grid">${list.map(card).join('')}</div></div>` : '';
}).join('\n')}
</section>
</div>
</div>`;
  write('index.html', layout({
    title: 'AllTools Hub - Free Online Tools for Text, Calculators and Developers',
    desc: 'Free online tools that run in your browser: word counter, loan and GST calculators, JSON formatter, password generator, unit converters and more. No sign-up.',
    path: '/', body, scripts: '<script src="/tools.js"></script>\n<script src="/home.js"></script>'
  }));
}

/* ---------- tool pages ---------- */
function toolPage(t) {
  const cat = catOf(t.cat);
  const same = TOOLS.filter(x => x.cat === t.cat && x.id !== t.id);
  const others = TOOLS.filter(x => x.cat !== t.cat && x.id !== t.id);
  const related = same.concat(others).slice(0, 4);
  const body = `
<div class="wrap">
<nav class="crumbs" aria-label="Breadcrumb"><a href="/">Home</a> / <a href="/#cat-${cat.id}">${esc(cat.name)}</a> / ${esc(t.name)}</nav>
<div class="tool-head"><h1>${esc(t.name)}</h1><p>${esc(t.intro)}</p></div>
<div class="tool-card" id="tool-root"><noscript><p class="msg err">This tool needs JavaScript. Please turn it on in your browser settings and reload the page.</p></noscript></div>
${t.note ? `<p class="tool-note"><strong>Please note:</strong> ${esc(t.note)}</p>` : ''}
<div class="info">
<section><h2>How to use this tool</h2><ol>${t.steps.map(s => `<li>${esc(s)}</li>`).join('')}</ol></section>
<section><h2>Your privacy</h2><p>This tool works inside your browser. What you type is not uploaded, saved or shared.</p></section>
</div>
<section class="related"><h2>More tools you may like</h2><div class="grid">${related.map(card).join('')}</div></section>
</div>`;
  write(`${t.id}.html`, layout({
    title: `${t.name} - Free Online Tool | AllTools Hub`,
    desc: `${t.desc} Free, no sign-up, and it works in your browser.`,
    path: `/${t.id}`, body, bodyAttr: ` data-tool="${t.id}"`,
    scripts: '<script src="/tools.js"></script>\n<script src="/tool.js"></script>'
  }));
}

/* ---------- information pages ---------- */
const PAGES = {
  about: {
    title: 'About AllTools Hub', desc: 'AllTools Hub offers free online tools that run in your browser. Learn what we build and how we keep your data private.',
    body: `<h1>About AllTools Hub</h1>
<p>AllTools Hub is a collection of free online tools for everyday jobs: counting words, working out a loan, formatting data, converting units and more. Each tool is built to be clear for a first-time visitor.</p>
<h2>How we work</h2>
<ul><li><strong>Simple.</strong> Every tool explains what it does, what to enter and what you will get.</li>
<li><strong>Private.</strong> Our tools run in your browser. The text and numbers you enter are not uploaded to our servers.</li>
<li><strong>Honest.</strong> We only list tools that work. We do not add a tool just to make the list longer.</li>
<li><strong>Free.</strong> You do not need an account to use any tool.</li></ul>
<h2>What is available today</h2>
<p>There are currently ${TOOLS.length} tools in ${CATEGORIES.length} categories: text tools, calculators, developer tools, unit converters and other everyday tools. We plan to add more over time, and we test each one before it is published.</p>
<h2>Tell us what you need</h2>
<p>Found a mistake, or want a new tool? Please visit our <a href="/contact">contact page</a>.</p>`
  },
  contact: {
    title: 'Contact AllTools Hub', desc: 'Report a bug, ask a question or suggest a new tool for AllTools Hub.',
    body: `<h1>Contact us</h1>
<p>We would like to hear from you. You can contact us to report a bug, ask a question, or suggest a new tool.</p>
<h2>How to reach us</h2>
<p>Please open a new issue on our public project page: <a href="https://github.com/smitbarot106-lang/AllTools-Hub/issues" rel="noopener">github.com/smitbarot106-lang/AllTools-Hub/issues</a>. You will need a free GitHub account.</p>
<h2>What to include</h2>
<ul><li>The name of the tool and the page address.</li><li>What you did, what you expected and what happened instead.</li><li>Your browser and device, if you know them.</li></ul>
<p>Please do not post passwords, private documents or other personal information.</p>`
  },
  privacy: {
    title: 'Privacy Policy - AllTools Hub', desc: 'How AllTools Hub handles your data. Our tools run in your browser and we do not collect what you type.',
    body: `<h1>Privacy Policy</h1><p class="updated">Last updated: 14 November 2026</p>
<p>This page explains, in plain language, what happens to information when you use AllTools Hub.</p>
<h2>What you enter into our tools</h2>
<p>Our tools run inside your web browser. The text, numbers and settings you enter are processed on your own device. We do not upload them to our servers, and we cannot see them.</p>
<h2>Information we do not collect</h2>
<ul><li>We do not ask you to create an account.</li><li>We do not ask for your name, email address or phone number to use a tool.</li><li>We do not set advertising or tracking cookies, and we do not currently use analytics or show ads.</li></ul>
<h2>What is stored on your device</h2>
<p>If you choose light or dark mode, your choice is saved in your browser's local storage so the site can remember it. It stays on your device. You can clear it at any time in your browser settings.</p>
<h2>Hosting</h2>
<p>This website is hosted on Cloudflare Pages. Like most web hosts, Cloudflare may process technical information such as your IP address and browser type to deliver the site and keep it secure. Please see Cloudflare's own privacy policy for details.</p>
<h2>Links to other sites</h2>
<p>Our contact page links to GitHub. We are not responsible for the privacy practices of other websites.</p>
<h2>Changes to this policy</h2>
<p>If we add features such as analytics or advertising, we will update this page before they start and change the date above.</p>
<h2>Questions</h2>
<p>If you have a question about privacy, please use our <a href="/contact">contact page</a>.</p>`
  },
  terms: {
    title: 'Terms and Conditions - AllTools Hub', desc: 'The terms for using AllTools Hub and its free online tools.',
    body: `<h1>Terms and Conditions</h1><p class="updated">Last updated: 14 November 2026</p>
<p>By using AllTools Hub, you agree to these terms. If you do not agree, please do not use the website.</p>
<h2>Use of the website</h2>
<p>You may use our tools for personal and business purposes. Please do not misuse the website: do not try to break it, overload it, or use it to do anything illegal.</p>
<h2>No guarantee</h2>
<p>We work hard to make every tool correct, but the website and its tools are provided "as is", without any promise that they are error-free, always available or right for your purpose. Please check important results yourself before you rely on them.</p>
<h2>Limit of responsibility</h2>
<p>To the extent allowed by law, AllTools Hub is not responsible for any loss or damage that comes from using the website or relying on a result from a tool.</p>
<h2>Our content</h2>
<p>The design, text and code of this website belong to AllTools Hub. Please do not copy the website as a whole and present it as your own. The text and data you enter into a tool remain yours.</p>
<h2>Changes</h2>
<p>We may change the website, the tools or these terms at any time. The date above shows the latest update.</p>
<h2>Contact</h2>
<p>Questions about these terms? Please use our <a href="/contact">contact page</a>.</p>`
  },
  disclaimer: {
    title: 'Disclaimer - AllTools Hub', desc: 'Important notes about the calculators and tools on AllTools Hub. Results are for information only.',
    body: `<h1>Disclaimer</h1><p class="updated">Last updated: 14 November 2026</p>
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
  write(`${name}.html`, layout({ title: p.title, desc: p.desc, path: `/${name}`, body: `<div class="wrap"><div class="prose">${p.body}</div></div>` }));
}

function notFound() {
  write('404.html', layout({
    title: 'Page not found - AllTools Hub', desc: 'This page could not be found.', path: '/404.html', noindex: true,
    body: `<div class="wrap"><div class="prose"><h1>Page not found</h1><p>The page you are looking for does not exist or has moved.</p><p><a class="btn" href="/">Go to the homepage</a></p></div></div>`
  }));
}

/* ---------- SEO files and headers ---------- */
function seoFiles() {
  const urls = ['/'].concat(TOOLS.map(t => `/${t.id}`), Object.keys(PAGES).map(n => `/${n}`));
  write('sitemap.xml', `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls.map(u => `  <url><loc>${SITE}${u}</loc><lastmod>${TODAY}</lastmod></url>`).join('\n')}\n</urlset>\n`);
  write('robots.txt', `User-agent: *\nAllow: /\n\nSitemap: ${SITE}/sitemap.xml\n`);
  write('_headers', `/*
  X-Content-Type-Options: nosniff
  X-Frame-Options: DENY
  Referrer-Policy: strict-origin-when-cross-origin
  Content-Security-Policy: default-src 'self'; script-src 'self'; style-src 'self'; img-src 'self' data:; base-uri 'self'; form-action 'self'; frame-ancestors 'none'
`);
}

home();
TOOLS.forEach(toolPage);
Object.keys(PAGES).forEach(infoPage);
notFound();
seoFiles();
console.log('Built ' + (TOOLS.length + Object.keys(PAGES).length + 2) + ' pages for ' + TOOLS.length + ' tools.');
