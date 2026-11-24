/* AllTools Hub - tool page engine.
   The form is already in the page HTML (written by build.js). This script finds it, runs the tool
   logic from tools.js and wires up the Copy, Download and Reset buttons. */
(function () {
  'use strict';

  var id = document.body.getAttribute('data-tool');
  var tool = window.TOOLS && window.TOOLS.filter(function (t) { return t.id === id; })[0];
  var root = document.getElementById('tool-root');
  if (!tool || !root) return;

  var $ = function (i) { return document.getElementById(i); };
  var form = $('tool-form'), msg = $('msg'), placeholder = $('placeholder'), results = $('results'), statsBox = $('stats');
  var outBox = $('out-box'), outLabel = $('out-label'), out = $('out');
  var btnCopy = $('btn-copy'), btnDown = $('btn-download'), btnReset = $('btn-reset');
  var inputs = {};
  tool.fields.forEach(function (f) { inputs[f.name] = $('f-' + f.name); });
  var last = null;

  function el(tag, attrs, text) {
    var n = document.createElement(tag);
    Object.keys(attrs || {}).forEach(function (k) { n.setAttribute(k, attrs[k]); });
    if (text != null) n.textContent = text;
    return n;
  }

  function values() {
    var v = {};
    tool.fields.forEach(function (f) {
      var i = inputs[f.name];
      v[f.name] = f.type === 'checkbox' ? i.checked : i.value;
    });
    return v;
  }

  function show(kind, text) {
    if (!text) { msg.hidden = true; msg.textContent = ''; return; }
    msg.className = 'msg ' + kind;
    msg.setAttribute('role', kind === 'err' ? 'alert' : 'status');
    msg.textContent = text;
    msg.hidden = false;
  }

  function setActions(hasResult, hasText) {
    if (!tool.live) {
      btnCopy.hidden = !hasResult;
      if (btnDown) btnDown.hidden = !hasText;
      if (placeholder) placeholder.hidden = hasResult;
    }
  }

  function clearInvalid() {
    tool.fields.forEach(function (f) { inputs[f.name].removeAttribute('aria-invalid'); });
  }

  function render(r) {
    last = r;
    statsBox.textContent = '';
    (r.stats || []).forEach(function (s) {
      statsBox.appendChild(el('div', { 'class': 'stat' }, null));
      var d = statsBox.lastChild;
      d.appendChild(el('dt', {}, s[0]));
      d.appendChild(el('dd', {}, s[1]));
    });
    statsBox.hidden = !(r.stats && r.stats.length);
    var hasText = typeof r.text === 'string';
    outBox.hidden = !hasText;
    if (hasText) {
      outLabel.textContent = r.textLabel || 'Result';
      out.value = r.text;
      out.rows = Math.min(14, Math.max(3, r.text.split('\n').length + 1));
    }
    results.hidden = false;
    setActions(true, hasText);
  }

  function run(quiet) {
    clearInvalid();
    try {
      render(tool.run(values()));
      show('', '');
      if (!quiet) show('ok', 'Done. Your result is below.');
    } catch (e) {
      last = null;
      results.hidden = true;
      setActions(false, false);
      show('err', e.message);
      var first = tool.fields.filter(function (f) { return f.type !== 'checkbox'; })[0];
      if (first && !quiet) inputs[first.name].setAttribute('aria-invalid', 'true');
    }
  }

  form.addEventListener('submit', function (e) { e.preventDefault(); if (!tool.live) run(false); });
  if (tool.live) {
    form.addEventListener('input', function () { run(true); });
    run(true);
  }

  function copyText(text) {
    if (navigator.clipboard && window.isSecureContext) return navigator.clipboard.writeText(text);
    return new Promise(function (resolve, reject) {
      var t = el('textarea', {});
      t.style.position = 'fixed'; t.style.opacity = '0';
      t.value = text; document.body.appendChild(t); t.select();
      try { document.execCommand('copy') ? resolve() : reject(); } catch (err) { reject(err); }
      document.body.removeChild(t);
    });
  }

  btnCopy.addEventListener('click', function () {
    if (!last) return;
    var text = typeof last.text === 'string' ? last.text : (last.stats || []).map(function (s) { return s[0] + ': ' + s[1]; }).join('\n');
    var orig = btnCopy.textContent;
    copyText(text).then(function () {
      show('ok', 'Copied to your clipboard.');
      btnCopy.textContent = 'Copied!';
      setTimeout(function () { btnCopy.textContent = orig; }, 2000);
    }, function () { show('err', 'Your browser blocked copying. Select the text and copy it by hand.'); });
  });

  if (btnDown) {
    btnDown.addEventListener('click', function () {
      if (!last || typeof last.text !== 'string') return;
      var blob = new Blob([last.text], { type: 'text/plain;charset=utf-8' });
      var a = el('a', { href: URL.createObjectURL(blob), download: tool.download || (tool.id + '.txt') });
      document.body.appendChild(a); a.click(); document.body.removeChild(a);
      setTimeout(function () { URL.revokeObjectURL(a.href); }, 1000);
      show('ok', 'File saved to your downloads.');
    });
  }

  btnReset.addEventListener('click', function () {
    tool.fields.forEach(function (f) {
      var i = inputs[f.name];
      if (f.type === 'checkbox') i.checked = !!f.default; else i.value = f.default != null ? f.default : '';
    });
    clearInvalid();
    last = null; results.hidden = true; show('', '');
    if (!tool.live) setActions(false, false); else run(true);
  });
})();
