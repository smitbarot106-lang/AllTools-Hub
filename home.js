/* AllTools Hub - homepage search.
   Filters the tool cards that are already in the page, ranks the best matches first,
   and supports links such as /?q=loan. */
(function () {
  'use strict';
  var q = document.getElementById('q');
  var browse = document.getElementById('browse');
  var box = document.getElementById('results');
  var grid = document.getElementById('results-grid');
  var count = document.getElementById('results-count');
  var empty = document.getElementById('results-empty');
  var form = document.getElementById('search-form');
  var clear = document.getElementById('q-clear');
  if (!q || !browse || !box || !grid) return;

  var source = [].slice.call(document.querySelectorAll('#all-tools li[data-name]'));

  function stem(w) { return w.length > 3 ? w.replace(/(ies|es|s)$/, function (m) { return m === 'ies' ? 'y' : ''; }) : w; }

  function score(li, terms) {
    var name = li.getAttribute('data-name'), kw = li.getAttribute('data-kw'), desc = li.getAttribute('data-desc'), total = 0;
    for (var i = 0; i < terms.length; i++) {
      var w = terms[i], s = stem(w), best = 0;
      if (name.indexOf(w) === 0) best = 6;
      else if (name.indexOf(' ' + w) !== -1) best = 5;
      else if (name.indexOf(s) !== -1) best = 4;
      else if (kw.indexOf(w) !== -1 || kw.indexOf(s) !== -1) best = 3;
      else if (desc.indexOf(w) !== -1 || desc.indexOf(s) !== -1) best = 1;
      if (!best) return 0;
      total += best;
    }
    return total;
  }

  function search() {
    var text = q.value.trim().toLowerCase();
    if (clear) clear.hidden = !q.value;
    if (!text) { browse.hidden = false; box.hidden = true; return; }
    var terms = text.split(/\s+/);
    var hits = source.map(function (li, i) { return { li: li, s: score(li, terms), i: i }; })
      .filter(function (h) { return h.s > 0; })
      .sort(function (a, b) { return b.s - a.s || a.i - b.i; });
    browse.hidden = true; box.hidden = false; grid.textContent = '';
    hits.forEach(function (h) { grid.appendChild(h.li.cloneNode(true)); });
    empty.hidden = hits.length > 0;
    count.textContent = hits.length ? hits.length + (hits.length === 1 ? ' tool found' : ' tools found') + ' for "' + q.value.trim() + '"' : '';
  }

  q.addEventListener('input', search);
  if (form) form.addEventListener('submit', function (e) { e.preventDefault(); search(); });
  if (clear) clear.addEventListener('click', function () { q.value = ''; search(); q.focus(); });
  q.addEventListener('keydown', function (e) { if (e.key === 'Escape' && q.value) { q.value = ''; search(); } });
  document.addEventListener('keydown', function (e) {
    var t = e.target, typing = t && (t.tagName === 'INPUT' || t.tagName === 'TEXTAREA' || t.tagName === 'SELECT' || t.isContentEditable);
    if (e.key === '/' && !typing && !e.ctrlKey && !e.metaKey && !e.altKey) { e.preventDefault(); q.focus(); }
  });
  var initial = new URLSearchParams(location.search).get('q');
  if (initial) { q.value = initial; search(); }
})();
