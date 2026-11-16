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

/* ---------- Golden Ratio art ----------
   A golden rectangle (w x h, Fibonacci sizes such as 610 x 377) is cut into squares: left, top, right, bottom, repeat.
   A quarter-circle arc in each square joins into the Fibonacci spiral. */
function spiral(W, H, max) {
  let x = 0, y = 0, w = W, h = H, S = null;
  const rects = [], arcs = [], sides = ['left', 'top', 'right', 'bottom'];
  for (let i = 0; i < max; i++) {
    const s = Math.min(w, h), side = sides[i % 4];
    if ((side === 'left' || side === 'right') !== (w > h) || s < 2) break;
    let sx = x, sy = y, restX, restY;
    if (side === 'left') { restX = x + s; x += s; w -= s; }
    else if (side === 'top') { restY = y + s; y += s; h -= s; }
    else if (side === 'right') { sx = x + w - s; restX = sx; w -= s; }
    else { sy = y + h - s; restY = sy; h -= s; }
    const corners = [[sx, sy], [sx + s, sy], [sx, sy + s], [sx + s, sy + s]];
    const adj = (a, b) => (a[0] === b[0]) !== (a[1] === b[1]);
    const onRest = c => (restX !== undefined ? c[0] === restX : c[1] === restY);
    if (!S) S = [sx, side === 'left' ? sy + s : sy + s]; // first arc starts at the bottom-left corner of the first square
    const same = (a, b) => a[0] === b[0] && a[1] === b[1];
    const C = corners.find(c => adj(c, S) && onRest(c));
    const E = corners.find(c => adj(c, C) && !same(c, S));
    const cross = (S[0] - C[0]) * (E[1] - C[1]) - (S[1] - C[1]) * (E[0] - C[0]);
    rects.push([sx, sy, s]); arcs.push({ S, E, s, sweep: cross > 0 ? 1 : 0 });
    S = E;
  }
  const d = 'M' + arcs[0].S.join(' ') + arcs.map(a => ` A${a.s} ${a.s} 0 0 ${a.sweep} ${a.E.join(' ')}`).join('');
  return { rects, d, eye: arcs[arcs.length - 1].E };
}
const G = spiral(610, 377, 12), GL = spiral(55, 34, 5);
const numText = r => { if (r[2] < 34) return ''; const fs = Math.min(Math.max(r[2] * 0.085, 8), 24); return `<text x="${r[0] + r[2] * 0.05 + 2}" y="${r[1] + fs + r[2] * 0.04 + 2}" font-size="${fs.toFixed(1)}">${r[2]}</text>`; };
const ART = `<svg class="art" viewBox="-4 -4 618 385" aria-hidden="true" focusable="false"><g class="sq">${G.rects.map(r => `<rect x="${r[0]}" y="${r[1]}" width="${r[2]}" height="${r[2]}"/>`).join('')}</g><g class="nums">${G.rects.map(numText).join('')}</g><path class="sp" pathLength="1" d="${G.d}"/></svg>`;
const SUN = (() => { const a = Math.PI * (3 - Math.sqrt(5)); let s = ''; for (let i = 1; i <= 144; i++) { const r = 7.3 * Math.sqrt(i), t = i * a; s += `<circle cx="${(r * Math.cos(t)).toFixed(1)}" cy="${(r * Math.sin(t)).toFixed(1)}" r="${(1 + i / 144 * 2.1).toFixed(1)}"/>`; } return `<svg class="m-svg" viewBox="-92 -92 184 184" aria-hidden="true" focusable="false">${s}</svg>`; })();
const RECT = '<svg class="m-svg m-rect" viewBox="0 0 220 150" aria-hidden="true" focusable="false"><rect x="14" y="14" width="161.8" height="100"/><line x1="114" y1="14" x2="114" y2="114"/><path d="M14 114 A100 100 0 0 1 114 14" class="arc"/><text x="94" y="136" text-anchor="middle">&phi; = 1.618</text><text x="188" y="68">1</text></svg>';
const FIB = (() => { const f = [1, 1, 2, 3, 5, 8, 13, 21, 34, 55, 89]; let rows = ''; for (let i = 1; i < f.length; i++) rows += `<tr><td>${f[i]} / ${f[i - 1]}</td><td>${(f[i] / f[i - 1]).toFixed(4)}</td></tr>`; return `<table class="fib"><thead><tr><th scope="col">Fibonacci pair</th><th scope="col">Ratio</th></tr></thead><tbody>${rows}</tbody><tfoot><tr><td>&phi; (limit)</td><td>${((1 + Math.sqrt(5)) / 2).toFixed(4)}</td></tr></tfoot></table>`; })();
const MATH = `<section class="math" aria-label="The mathematics behind the design"><div class="math-grid">
<figure><div class="m-art">${RECT}</div><figcaption><h3>The golden rectangle</h3><p>Cut a square from a rectangle with sides in the ratio &phi; to 1, and what is left is another golden rectangle. Repeat, and the corners trace the spiral on the homepage.</p></figcaption></figure>
<figure><div class="m-art">${SUN}</div><figcaption><h3>The golden angle</h3><p>Turn 137.5 degrees (360 divided by &phi; squared) for each new seed and the seeds pack without gaps, as in a sunflower. These are 144 seeds.</p></figcaption></figure>
<figure><div class="m-art">${FIB}</div><figcaption><h3>Fibonacci numbers</h3><p>Divide each Fibonacci number by the one before it and the answer settles on &phi; &asymp; 1.618.</p></figcaption></figure>
</div></section>`;
const LOGO = `<svg viewBox="-3 -3 61 40" aria-hidden="true"><g fill="none" stroke="currentColor" stroke-opacity=".4" stroke-width="1.2">${GL.rects.map(r => `<rect x="${r[0]}" y="${r[1]}" width="${r[2]}" height="${r[2]}"/>`).join('')}</g><path d="${GL.d}" fill="none" stroke="#b8923a" stroke-width="2.6" stroke-linecap="round"/></svg>`;

write('favicon.svg', `<svg xmlns="http://www.w3.org/2000/svg" viewBox="-9 -9 73 52"><rect x="-9" y="-9" width="73" height="52" rx="9" fill="#1d1b18"/><g fill="none" stroke="#f8f3e6" stroke-opacity=".45" stroke-width="1.2">${GL.rects.map(r => `<rect x="${r[0]}" y="${r[1]}" width="${r[2]}" height="${r[2]}"/>`).join('')}</g><path d="${GL.d}" fill="none" stroke="#d4ad55" stroke-width="3" stroke-linecap="round"/></svg>`);

/* Golden Ratio Open Graph Social Preview Image (1200x630) */
const OG_SPIRAL = spiral(377, 233, 9);
write('og-image.svg', `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630" viewBox="0 0 1200 630">
  <rect width="1200" height="630" fill="#14110d"/>
  <g transform="translate(730, 198)" stroke="#b8923a" fill="none">
    <g stroke-opacity=".35" stroke-width="1.5">${OG_SPIRAL.rects.map(r => `<rect x="${r[0]}" y="${r[1]}" width="${r[2]}" height="${r[2]}"/>`).join('')}</g>
    <path d="${OG_SPIRAL.d}" stroke="#d9b05a" stroke-width="3.5" stroke-linecap="round"/>
  </g>
  <text x="100" y="270" font-family="'Palatino Linotype', Palatino, Georgia, serif" font-weight="700" font-size="72" fill="#f2ead7">AllTools Hub</text>
  <text x="100" y="340" font-family="'Palatino Linotype', Palatino, Georgia, serif" font-style="italic" font-size="32" fill="#d9b05a">Everyday tools, drawn to the golden ratio</text>
  <text x="100" y="420" font-family="system-ui, -apple-system, sans-serif" font-size="24" fill="#f2ead7" opacity=".75">Free browser-based tools for text, calculation and code.</text>
  <text x="100" y="460" font-family="system-ui, -apple-system, sans-serif" font-size="20" fill="#f2ead7" opacity=".5">Private &bull; Fast &bull; No sign-up &bull; &phi; &asymp; 1.618</text>
</svg>`);

const THEME_ICON = '<svg class="i-moon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M20 14.5A8.5 8.5 0 0 1 9.5 4 8.5 8.5 0 1 0 20 14.5z"/></svg><svg class="i-sun" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M2 12h2M20 12h2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/></svg>';

function layout(o) {
  const url = SITE + o.path;
  const ld = o.ld ? `\n<script type="application/ld+json">${(typeof o.ld === 'string' ? o.ld : JSON.stringify(o.ld)).replace(/</g, '\\u003c')}</script>` : '';
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
<meta name="twitter:card" content="summary_large_image">
<meta property="og:image" content="${SITE}/og-image.svg">
<meta name="twitter:image" content="${SITE}/og-image.svg">${o.noindex ? '\n<meta name="robots" content="noindex">' : ''}${o.extraHead ? '\n' + o.extraHead : ''}
<link rel="icon" href="/favicon.svg" type="image/svg+xml">
<link rel="stylesheet" href="/style.css">
<script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-4624647370340615"
     crossorigin="anonymous"></script>
<script src="/site.js"></script>${ld}
</head>
<body${o.bodyAttr || ''}>
<a class="skip" href="#main">Skip to content</a>
<header class="site-header"><div class="wrap bar">
<a class="brand" href="/index.html">${LOGO}<span>AllTools Hub</span></a>
<nav class="nav" aria-label="Main"><a href="/index.html#all-tools">All tools</a><a href="/about.html">About</a><a href="/contact.html">Contact</a></nav>
<button class="icon-btn" id="theme-toggle" type="button" aria-label="Switch between light and dark mode" aria-pressed="false">${THEME_ICON}</button>
</div></header>
<main id="main">
${o.body}
</main>
<footer class="site-footer"><div class="wrap">
<div class="foot">
<div class="foot-about"><a class="brand" href="/index.html">${LOGO}<span>AllTools Hub</span></a><p>Free online tools that work in your browser. Nothing you type is sent to our servers.</p></div>
<div><h2>Tools</h2><ul>${CATEGORIES.map(c => `<li><a href="/index.html#cat-${c.id}">${esc(c.name)}</a></li>`).join('')}</ul></div>
<div><h2>Site</h2><ul><li><a href="/about.html">About</a></li><li><a href="/contact.html">Contact</a></li><li><a href="/privacy.html">Privacy Policy</a></li><li><a href="/terms.html">Terms and Conditions</a></li><li><a href="/disclaimer.html">Disclaimer</a></li></ul></div>
</div>
<p class="copy">&copy; 2026 AllTools Hub. All rights reserved.</p>
</div></footer>
${o.scripts || ''}
</body>
</html>
`;
}

const row = t => `<li><a href="/${t.id}.html"><span class="g" aria-hidden="true">${esc(t.icon)}</span><span class="n">${esc(t.name)}</span><span class="d">${esc(t.desc)}</span></a></li>`;

/* ---------- home ---------- */
function home() {
  const popular = TOOLS.filter(t => t.popular).slice(0, 6);
  const featured = TOOLS.filter(t => t.featured).slice(0, 3);
  const recent = TOOLS.map((t, i) => [t, i]).sort((a, b) => (b[0].added > a[0].added ? 1 : b[0].added < a[0].added ? -1 : a[1] - b[1])).map(x => x[0]).slice(0, 6);
  const body = `
<section class="hero"><div class="wrap hero-grid">
<div class="hero-text">
<h1>Free online tools that work in your browser</h1>
<p class="lead">Count words, work out a loan, format JSON or make a strong password. Every tool runs in your browser, so what you type stays on your device.</p>
<div class="search" role="search">
<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/></svg>
<input id="q" type="search" placeholder="Search ${TOOLS.length} tools, e.g. &quot;loan&quot;" aria-label="Search tools" autocomplete="off">
<button type="button" class="q-clear" id="q-clear" aria-label="Clear search" hidden>&times;</button>
</div>
<p class="cats-line" id="categories">${CATEGORIES.map(c => `<a href="#cat-${c.id}">${esc(c.name)} <span>${TOOLS.filter(t => t.cat === c.id).length}</span></a>`).join('')}</p>
</div>
<figure class="hero-art">${ART}<figcaption>Fibonacci squares inside a golden rectangle, 1 : 1.618.</figcaption></figure>
</div></section>

<div class="wrap" id="results" hidden>
<section class="block"><div class="block-head"><h2>Search results</h2><p id="results-count"></p></div><ul class="index-list" id="results-grid"></ul></section>
</div>

<div id="browse"><div class="wrap">
<section class="block"><div class="block-head"><h2>Featured</h2></div>
<div class="feature-grid">${featured.map((t, i) => `<a class="feature f${i + 1}" href="/${t.id}.html"><span class="f-ico" aria-hidden="true">${esc(t.icon)}</span><h3>${esc(t.name)}</h3><p>${esc(t.desc)}</p></a>`).join('')}</div></section>
<section class="block band"><div><div class="block-head"><h2>Popular</h2></div><ul class="index-list">${popular.map(row).join('')}</ul></div>
<div><div class="block-head"><h2>Recently added</h2></div><ul class="plain-list">${recent.map(t => `<li><a href="/${t.id}.html">${esc(t.name)}</a></li>`).join('')}</ul></div></section>
<section class="block" id="all-tools"><div class="block-head"><h2>All tools</h2><p>${TOOLS.length} tools in ${CATEGORIES.length} categories</p></div>
${CATEGORIES.map(c => {
  const list = TOOLS.filter(t => t.cat === c.id);
  return list.length ? `<div class="index-row" id="cat-${c.id}"><div class="index-cat"><h3>${esc(c.name)}</h3><p>${esc(c.blurb)}</p></div><ul class="index-list">${list.map(row).join('')}</ul></div>` : '';
}).join('\n')}
</section>
</div></div>`;
  write('index.html', layout({
    title: 'AllTools Hub - Free Online Tools for Text, Calculators and Developers',
    desc: 'Free online tools that run in your browser: word counter, loan and GST calculators, JSON formatter, password generator, unit converters and more. No sign-up.',
    path: '/', extraHead: '<meta name="google-site-verification" content="IJoQ3jtkGflEm8lZiyXrhtS3oLgVRDWqT22zVBc_IsQ" />', body, scripts: '<script src="/tools.js"></script>\n<script src="/home.js"></script>',
    ld: {
      '@context': 'https://schema.org',
      '@type': 'WebSite',
      name: 'AllTools Hub',
      url: SITE + '/',
      description: 'Free online tools that run in your browser: word counter, loan and GST calculators, JSON formatter, password generator, unit converters and more.',
      potentialAction: {
        '@type': 'SearchAction',
        target: {
          '@type': 'EntryPoint',
          urlTemplate: SITE + '/?q={search_term_string}'
        },
        'query-input': 'required name=search_term_string'
      }
    }
  }));
}

/* ---------- tool pages ---------- */
function toolPage(t) {
  const cat = catOf(t.cat);
  const same = TOOLS.filter(x => x.cat === t.cat && x.id !== t.id);
  const others = TOOLS.filter(x => x.cat !== t.cat && x.id !== t.id);
  const related = same.concat(others).slice(0, 5);
  const body = `
<div class="wrap">
<nav class="crumbs" aria-label="Breadcrumb"><a href="/index.html">Home</a> / <a href="/index.html#cat-${cat.id}">${esc(cat.name)}</a> / ${esc(t.name)}</nav>
<header class="tool-head"><h1>${esc(t.name)}</h1><p>${esc(t.intro)}</p></header>
<div class="tool-layout">
<div class="tool-main"><div class="tool-card" id="tool-root"><noscript><p class="msg err">This tool needs JavaScript. Please turn it on in your browser settings and reload the page.</p></noscript></div>
${t.note ? `<p class="tool-note"><strong>Please note:</strong> ${esc(t.note)}</p>` : ''}</div>
<aside class="tool-side" aria-label="Help">
<section><h2>How to use this tool</h2><ol class="steps">${t.steps.map(s => `<li>${esc(s)}</li>`).join('')}</ol></section>
<section><h2>Your privacy</h2><p>This tool works inside your browser. What you type is not uploaded, saved or shared.</p></section>
<section><h2>More tools</h2><ul class="plain-list">${related.map(x => `<li><a href="/${x.id}.html">${esc(x.name)}</a></li>`).join('')}</ul></section>
</aside>
</div>
</div>`;
  write(`${t.id}.html`, layout({
    title: `${t.name} - Free Online Tool | AllTools Hub`,
    desc: `${t.desc} Free, no sign-up, and it works in your browser.`,
    path: `/${t.id}`, body, bodyAttr: ` data-tool="${t.id}"`,
    scripts: '<script src="/tools.js"></script>\n<script src="/tool.js"></script>',
    ld: [
      {
        '@context': 'https://schema.org',
        '@type': 'WebApplication',
        name: t.name,
        description: `${t.desc} Free, no sign-up, and it works in your browser.`,
        url: `${SITE}/${t.id}`,
        applicationCategory: 'UtilityApplication',
        operatingSystem: 'Any',
        offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
        browserRequirements: 'Requires JavaScript'
      },
      {
        '@context': 'https://schema.org',
        '@type': 'BreadcrumbList',
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: 'Home', item: SITE + '/' },
          { '@type': 'ListItem', position: 2, name: cat.name, item: `${SITE}/#cat-${cat.id}` },
          { '@type': 'ListItem', position: 3, name: t.name, item: `${SITE}/${t.id}` }
        ]
      }
    ]
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
<h2>About the design</h2>
<p>The look of the site is built on the golden ratio (about 1.618) and the Fibonacci numbers. Columns split in that ratio, type sizes step by it, and spacing follows the Fibonacci sequence. The maths is there to keep things balanced. It should never get in the way of the tools. The three figures below show where it comes from.</p>
<h2>Tell us what you need</h2>
<p>Found a mistake, or want a new tool? Please visit our <a href="/contact.html">contact page</a>.</p>`
  },
  contact: {
    title: 'Contact AllTools Hub', desc: 'Report a bug, ask a question, suggest a new tool or discuss privacy matters for AllTools Hub.',
    body: `<h1>Contact us</h1>
<p>We would like to hear from you. You can contact us to report a bug, ask a question, suggest a new tool or discuss privacy matters.</p>
<h2>How to reach us</h2>
<ul>
<li><strong>Email:</strong> For general inquiries, feedback or privacy questions, write to us at <a href="mailto:smitbarot106@gmail.com">smitbarot106@gmail.com</a>.</li>
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
    body: `<h1>Privacy Policy</h1><p class="updated">Last updated: 16 November 2026</p>
<p>This page explains, in plain language, how AllTools Hub handles information when you visit our website and use our free online tools.</p>
<h2>What you enter into our tools</h2>
<p>AllTools Hub is designed with privacy by default. Every tool on this website runs directly inside your web browser using client-side JavaScript.</p>
<ul>
<li>The text, numbers, calculations and settings you enter are processed locally in your device's memory.</li>
<li>We do not transmit, upload, log or store your tool inputs or calculation results on our servers or with any third party.</li>
<li>When you copy results to your clipboard or download a generated file, that action takes place entirely on your device.</li>
</ul>
<h2>Google AdSense and advertising cookies</h2>
<p>We have integrated Google AdSense code on our website for account verification and site review.</p>
<ul>
<li><strong>Current status:</strong> AllTools Hub is currently under review by Google AdSense. Advertisements are not yet actively being served on the website.</li>
<li><strong>Prospective ad serving and cookies:</strong> Once our website is approved and advertising begins, third-party vendors, including Google, will use cookies to serve ads based on your prior visits to this website or other websites on the internet.</li>
<li><strong>Personalized advertising:</strong> Google's use of advertising cookies enables it and its partners to serve ads to you based on your visit to AllTools Hub and/or other sites across the internet.</li>
<li><strong>Opt-out choices:</strong> You can opt out of personalized advertising at any time by visiting <a href="https://adssettings.google.com/" rel="noopener" target="_blank">Google Ads Settings</a>. You can also opt out of third-party advertising cookies by visiting <a href="https://www.aboutads.info/choices/" rel="noopener" target="_blank">aboutads.info/choices</a> or <a href="https://www.youronlinechoices.com/" rel="noopener" target="_blank">youronlinechoices.com</a>.</li>
</ul>
<h2>Web analytics</h2>
<p>Cloudflare Web Analytics client-side tracking (beacon script) is not currently active on this website. We do not use third-party analytics trackers, tracking pixels or session recording scripts.</p>
<h2>Local storage on your device</h2>
<p>We do not use cookies for site functionality. Our website uses your browser's local storage (<code>localStorage</code>) solely to remember your preferred theme (<code>light</code> or <code>dark</code> mode). This setting stays on your device, contains no personal information, and can be cleared at any time in your browser settings.</p>
<h2>Hosting and security</h2>
<p>This website is hosted on Cloudflare Pages. As a reverse proxy and content delivery network (CDN), Cloudflare processes standard technical network connection data (such as visitor IP addresses, browser user agent strings and requested URLs) to route traffic and protect the site against attacks. We do not maintain or store access server logs directly. For details, please see the <a href="https://www.cloudflare.com/privacypolicy/" rel="noopener" target="_blank">Cloudflare Privacy Policy</a>.</p>
<h2>External links</h2>
<p>Our website links to external platforms such as GitHub. We are not responsible for the privacy practices of external websites.</p>
<h2>Changes to this policy</h2>
<p>If our advertising status changes or if we introduce new features, we will update this page and revise the date above.</p>
<h2>Questions</h2>
<p>If you have any questions about this privacy policy, please email us at <a href="mailto:smitbarot106@gmail.com">smitbarot106@gmail.com</a> or visit our <a href="/contact.html">contact page</a>.</p>`
  },
  terms: {
    title: 'Terms and Conditions - AllTools Hub', desc: 'The terms for using AllTools Hub and its free online tools.',
    body: `<h1>Terms and Conditions</h1><p class="updated">Last updated: 16 November 2026</p>
<p>By using AllTools Hub, you agree to these terms. If you do not agree, please do not use the website.</p>
<h2>Use of the website</h2>
<p>You may use our tools for personal and business purposes. Please do not misuse the website: do not try to break it, overload it, or use it to do anything illegal.</p>
<h2>No guarantee</h2>
<p>We work hard to make every tool correct, but the website and its tools are provided "as is", without any promise that they are error-free, always available or right for your purpose. Please check important results yourself before you rely on them.</p>
<h2>Limit of responsibility</h2>
<p>To the extent allowed by law, AllTools Hub is not responsible for any loss or damage that comes from using the website or relying on a result from a tool.</p>
<h2>Our content</h2>
<p>The design, text and code of this website belong to AllTools Hub. Please do not copy the website as a whole and present it as your own. The text and data you enter into a tool remain yours.</p>
<h2>Third-party services</h2>
<p>AllTools Hub includes links to external websites and integrates third-party services such as Google AdSense. Google AdSense code is installed on the site for account verification; advertisements are not yet actively served while site approval is pending. When you follow external links (such as to GitHub) or interact with third-party features, your use is subject to the terms and privacy policies of those third-party providers.</p>
<h2>Changes</h2>
<p>We may change the website, the tools or these terms at any time. The date above shows the latest update.</p>
<h2>Contact</h2>
<p>Questions about these terms? Please use our <a href="/contact.html">contact page</a>.</p>`
  },
  disclaimer: {
    title: 'Disclaimer - AllTools Hub', desc: 'Important notes about the calculators and tools on AllTools Hub. Results are for information only.',
    body: `<h1>Disclaimer</h1><p class="updated">Last updated: 16 November 2026</p>
<p>The tools on AllTools Hub give general information and estimates. They are not professional advice.</p>
<h2>Financial and tax calculators</h2>
<p>The GST, discount, percentage and EMI calculators give estimates. Real taxes, bank fees and loan terms can differ. Please confirm figures with your bank, tax adviser or the seller before you make a decision.</p>
<h2>Health calculators</h2>
<p>The BMI calculator is a screening number for adults. It is not a medical diagnosis. Please talk to a doctor or another qualified health professional about your health.</p>
<h2>Security tools</h2>
<p>The password generator creates random passwords in your browser. You are responsible for keeping your passwords safe. Base64 is an encoding, not encryption, and does not protect secret information.</p>
<h2>Accuracy</h2>
<p>We test our tools, but mistakes can still happen. If you find one, please tell us on the <a href="/contact.html">contact page</a>.</p>`
  }
};

function infoPage(name) {
  const p = PAGES[name];
  write(`${name}.html`, layout({ title: p.title, desc: p.desc, path: `/${name}`, body: `<div class="wrap"><div class="prose">${p.body}</div>${name === 'about' ? MATH : ''}</div>` }));
}

function notFound() {
  write('404.html', layout({
    title: 'Page not found - AllTools Hub', desc: 'This page could not be found.', path: '/404.html', noindex: true,
    body: `<div class="wrap"><div class="prose notfound"><div class="nf-art" aria-hidden="true">${ART}</div><h1>Page not found</h1><p>The page you are looking for does not exist or has moved.</p><p><a class="btn" href="/index.html">Go to the homepage</a></p></div></div>`
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
  Content-Security-Policy: default-src 'self'; script-src 'self' https://pagead2.googlesyndication.com; style-src 'self'; img-src 'self' data:; base-uri 'self'; form-action 'self'; frame-ancestors 'none'
`);
}

home();
TOOLS.forEach(toolPage);
Object.keys(PAGES).forEach(infoPage);
notFound();
seoFiles();
console.log('Built ' + (TOOLS.length + Object.keys(PAGES).length + 2) + ' pages for ' + TOOLS.length + ' tools.');
