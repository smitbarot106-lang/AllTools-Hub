/* AllTools Hub - tool page engine.
   Reads the tool definition from tools.js, builds the form and wires up the buttons. */
(function () {
  'use strict';

  var id = document.body.getAttribute('data-tool');
  var tool = window.TOOLS.filter(function (t) { return t.id === id; })[0];
  var root = document.getElementById('tool-root');
  if (!tool || !root) return;

  function el(tag, attrs, kids) {
    var n = document.createElement(tag);
    Object.keys(attrs || {}).forEach(function (k) {
      if (k === 'class') n.className = attrs[k];
      else if (k === 'text') n.textContent = attrs[k];
      else n.setAttribute(k, attrs[k]);
    });
    (kids || []).forEach(function (c) { n.appendChild(c); });
    return n;
  }

  var inputs = {};
  var form = el('form', { class: 'tool-form', novalidate: '', autocomplete: 'off' });
  var fieldsBox = el('div', { class: 'fields' });

  tool.fields.forEach(function (f) {
    var fid = 'f-' + f.name, wrap, input;
    if (f.type === 'checkbox') {
      input = el('input', { type: 'checkbox', id: fid });
      input.checked = !!f.default;
      wrap = el('div', { class: 'field check' }, [el('label', { for: fid }, [input, el('span', { text: f.label })])]);
    } else {
      if (f.type === 'textarea') input = el('textarea', { id: fid, rows: f.rows || 6, spellcheck: 'false' });
      else if (f.type === 'select') {
        input = el('select', { id: fid });
        f.options.forEach(function (o) { var op = el('option', { value: o[0], text: o[1] }); input.appendChild(op); });
      } else {
        input = el('input', { type: f.type, id: fid });
        ['min', 'max', 'step'].forEach(function (a) { if (f[a] != null) input.setAttribute(a, f[a]); });
        if (f.type === 'number') input.setAttribute('inputmode', 'decimal');
      }
      if (f.placeholder) input.setAttribute('placeholder', f.placeholder);
      input.value = f.default != null ? f.default : '';
      var kids = [el('label', { for: fid, text: f.label }), input];
      if (f.help) kids.push(el('span', { class: 'help', text: f.help }));
      wrap = el('div', { class: 'field' + (f.type === 'textarea' ? ' full' : '') }, kids);
    }
    inputs[f.name] = input;
    fieldsBox.appendChild(wrap);
  });
  form.appendChild(fieldsBox);

  var actions = el('div', { class: 'actions' });
  var btnRun = null;
  if (!tool.live) {
    btnRun = el('button', { type: 'submit', class: 'btn', text: tool.action || 'Calculate' });
    actions.appendChild(btnRun);
  }
  var btnCopy = el('button', { type: 'button', class: 'btn ghost', text: tool.live ? 'Copy results' : 'Copy', hidden: '' });
  var btnDown = el('button', { type: 'button', class: 'btn ghost', text: 'Download', hidden: '' });
  var btnReset = el('button', { type: 'button', class: 'btn ghost', text: 'Reset' });
  if (tool.live) btnCopy.removeAttribute('hidden');
  actions.appendChild(btnCopy);
  if (tool.download) actions.appendChild(btnDown);
  actions.appendChild(btnReset);
  form.appendChild(actions);

  var msg = el('div', { class: 'msg', role: 'status', 'aria-live': 'polite', hidden: '' });
  var results = el('div', { class: 'results', hidden: '' });
  var statsBox = el('dl', { class: 'stats' });
  var outLabel = el('label', { for: 'out', class: 'out-label' });
  var out = el('textarea', { id: 'out', class: 'out', readonly: '', rows: 6, spellcheck: 'false' });
  var outBox = el('div', { class: 'out-box', hidden: '' }, [outLabel, out]);
  results.appendChild(statsBox);
  results.appendChild(outBox);

  root.appendChild(form);
  root.appendChild(msg);
  root.appendChild(results);

  var last = null;

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
    msg.textContent = text;
    msg.hidden = false;
  }

  function render(r) {
    last = r;
    statsBox.textContent = '';
    (r.stats || []).forEach(function (s) {
      statsBox.appendChild(el('div', { class: 'stat' }, [el('dt', { text: s[0] }), el('dd', { text: s[1] })]));
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
    if (!tool.live) { btnCopy.hidden = false; btnDown.hidden = !hasText; }
  }

  function run(quiet) {
    try {
      var r = tool.run(values());
      render(r);
      show('', '');
      if (!quiet) show('ok', 'Done. Your result is below.');
    } catch (e) {
      last = null;
      results.hidden = true;
      if (!tool.live) { btnCopy.hidden = true; btnDown.hidden = true; }
      show('err', e.message);
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
    copyText(text).then(function () { show('ok', 'Copied to your clipboard.'); },
      function () { show('err', 'Your browser blocked copying. Select the text and copy it by hand.'); });
  });

  btnDown.addEventListener('click', function () {
    if (!last || typeof last.text !== 'string') return;
    var blob = new Blob([last.text], { type: 'text/plain;charset=utf-8' });
    var a = el('a', { href: URL.createObjectURL(blob), download: tool.download || (tool.id + '.txt') });
    document.body.appendChild(a); a.click(); document.body.removeChild(a);
    setTimeout(function () { URL.revokeObjectURL(a.href); }, 1000);
    show('ok', 'File saved to your downloads.');
  });

  btnReset.addEventListener('click', function () {
    tool.fields.forEach(function (f) {
      var i = inputs[f.name];
      if (f.type === 'checkbox') i.checked = !!f.default; else i.value = f.default != null ? f.default : '';
    });
    last = null; results.hidden = true; show('', '');
    if (!tool.live) { btnCopy.hidden = true; btnDown.hidden = true; } else run(true);
  });
})();
