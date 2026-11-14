/* AllTools Hub - theme (light / dark). Loaded in <head> so the right theme shows with no flash. */
(function () {
  'use strict';
  var KEY = 'allToolsHubTheme', theme = null;
  try { theme = localStorage.getItem(KEY); } catch (e) { /* storage blocked: ignore */ }
  if (theme !== 'light' && theme !== 'dark') {
    theme = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  }
  document.documentElement.setAttribute('data-theme', theme);

  document.addEventListener('DOMContentLoaded', function () {
    var b = document.getElementById('theme-toggle');
    if (!b) return;
    function sync() { b.setAttribute('aria-pressed', document.documentElement.getAttribute('data-theme') === 'dark' ? 'true' : 'false'); }
    sync();
    b.addEventListener('click', function () {
      var next = document.documentElement.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
      document.documentElement.setAttribute('data-theme', next);
      try { localStorage.setItem(KEY, next); } catch (e) { /* ignore */ }
      sync();
    });
  });
})();
