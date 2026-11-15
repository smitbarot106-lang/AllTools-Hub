/* AllTools Hub - homepage search. Filters the tool list as the visitor types. */
(function () {
  'use strict';
  var q = document.getElementById('q');
  var browse = document.getElementById('browse');
  var box = document.getElementById('results');
  var grid = document.getElementById('results-grid');
  var count = document.getElementById('results-count');
  if (!q || !window.TOOLS) return;

  var catName = {};
  window.CATEGORIES.forEach(function (c) { catName[c.id] = c.name; });

  function card(t) {
    var li = document.createElement('li'), a = document.createElement('a');
    a.href = '/' + t.id + '.html';
    [['g', t.icon], ['n', t.name], ['d', t.desc]].forEach(function (p) {
      var s = document.createElement('span'); s.className = p[0]; s.textContent = p[1];
      if (p[0] === 'g') s.setAttribute('aria-hidden', 'true');
      a.appendChild(s);
    });
    li.appendChild(a);
    return li;
  }

  function search() {
    var text = q.value.trim().toLowerCase();
    if (!text) { browse.hidden = false; box.hidden = true; return; }
    var terms = text.split(/\s+/);
    var hits = window.TOOLS.filter(function (t) {
      var hay = (t.name + ' ' + t.desc + ' ' + catName[t.cat] + ' ' + (t.keywords || []).join(' ')).toLowerCase();
      return terms.every(function (w) { return hay.indexOf(w) !== -1; });
    });
    browse.hidden = true; box.hidden = false; grid.textContent = '';
    if (!hits.length) {
      count.textContent = 'No tool matches "' + q.value.trim() + '". Try a simpler word, such as "text", "loan" or "convert".';
    } else {
      count.textContent = hits.length + (hits.length === 1 ? ' tool found' : ' tools found');
      hits.forEach(function (t) { grid.appendChild(card(t)); });
    }
  }

  var clear = document.getElementById('q-clear');
  function sync() { if (clear) clear.hidden = !q.value; }
  q.addEventListener('input', function () { sync(); search(); });
  if (clear) clear.addEventListener('click', function () { q.value = ''; sync(); search(); q.focus(); });
  document.addEventListener('keydown', function (e) {
    var t = e.target, typing = t && (t.tagName === 'INPUT' || t.tagName === 'TEXTAREA' || t.tagName === 'SELECT' || t.isContentEditable);
    if (e.key === '/' && !typing && !e.ctrlKey && !e.metaKey && !e.altKey) { e.preventDefault(); q.focus(); }
  });
  q.addEventListener('keydown', function (e) { if (e.key === 'Escape') { q.value = ''; sync(); search(); } });
  var params = new URLSearchParams(location.search);
  if (params.get('q')) { q.value = params.get('q'); sync(); search(); }
})();
