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
    var a = document.createElement('a');
    a.className = 'card'; a.href = '/' + t.id;
    var i = document.createElement('span'); i.className = 'ico'; i.setAttribute('aria-hidden', 'true'); i.textContent = t.icon;
    var n = document.createElement('span'); n.className = 'card-t'; n.textContent = t.name;
    var d = document.createElement('span'); d.className = 'card-d'; d.textContent = t.desc;
    a.appendChild(i); a.appendChild(n); a.appendChild(d);
    return a;
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

  q.addEventListener('input', search);
  q.addEventListener('keydown', function (e) { if (e.key === 'Escape') { q.value = ''; search(); } });
  var params = new URLSearchParams(location.search);
  if (params.get('q')) { q.value = params.get('q'); search(); }
})();
