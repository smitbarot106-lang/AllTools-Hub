/* AllTools Hub - theme (light / dark) and mobile menu.
   Loaded in <head> so the right theme shows with no flash. */
(function () {
  'use strict';
  var KEY = 'allToolsHubTheme', theme = null, root = document.documentElement;
  try { theme = localStorage.getItem(KEY); } catch (e) { /* storage blocked: ignore */ }
  if (theme !== 'light' && theme !== 'dark') {
    theme = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  }
  root.setAttribute('data-theme', theme);
  root.classList.add('js');

  document.addEventListener('DOMContentLoaded', function () {
    var b = document.getElementById('theme-toggle');
    if (b) {
      var sync = function () { b.setAttribute('aria-pressed', root.getAttribute('data-theme') === 'dark' ? 'true' : 'false'); };
      sync();
      b.addEventListener('click', function () {
        var next = root.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
        root.setAttribute('data-theme', next);
        try { localStorage.setItem(KEY, next); } catch (e) { /* ignore */ }
        sync();
      });
    }

    var menu = document.getElementById('menu-toggle'), nav = document.getElementById('site-nav');
    if (menu && nav) {
      var set = function (open) {
        nav.classList.toggle('open', open);
        menu.setAttribute('aria-expanded', open ? 'true' : 'false');
        menu.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
      };
      menu.addEventListener('click', function () { set(menu.getAttribute('aria-expanded') !== 'true'); });
      document.addEventListener('keydown', function (e) {
        if (e.key === 'Escape' && menu.getAttribute('aria-expanded') === 'true') { set(false); menu.focus(); }
      });
      nav.addEventListener('click', function (e) { if (e.target.closest && e.target.closest('a')) set(false); });
    }
  });
})();
