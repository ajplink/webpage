/**
 * theme.js — the site's single piece of client-side JavaScript.
 *
 * DOCUMENTED PROGRESSIVE ENHANCEMENT (see AGENTS.md): without JavaScript the
 * site follows the OS colour scheme and looks right; this file only lets a
 * visitor pin light/dark across pages. No dependencies, no network, no
 * cookies. Served from 'self' so the CSP (public/_headers) stays strict.
 *
 * Runs synchronously in <head> (it is tiny and cached) so the chosen theme is
 * applied before first paint — no flash of the wrong scheme.
 */
(function () {
  var KEY = 'plink-theme';
  var root = document.documentElement;

  /* Flag the document as JS-capable before first paint (reveals the theme
     toggle without a layout shift on every navigation). */
  root.classList.add('js');

  /* Restore a pinned theme before first paint. */
  try {
    var saved = localStorage.getItem(KEY);
    if (saved === 'light' || saved === 'dark') root.setAttribute('data-theme', saved);
  } catch (e) {
    /* Storage unavailable (private mode, cookies blocked): OS preference wins. */
  }

  function isDark() {
    var pinned = root.getAttribute('data-theme');
    if (pinned) return pinned === 'dark';
    return matchMedia('(prefers-color-scheme: dark)').matches;
  }

  function paint() {
    var dark = isDark();
    var buttons = document.querySelectorAll('[data-theme-toggle]');
    for (var i = 0; i < buttons.length; i++) {
      var button = buttons[i];
      button.setAttribute('aria-pressed', String(dark));
      button.setAttribute('aria-label', dark ? button.dataset.labelLight : button.dataset.labelDark);
    }
  }

  addEventListener('DOMContentLoaded', function () {
    var buttons = document.querySelectorAll('[data-theme-toggle]');
    for (var i = 0; i < buttons.length; i++) {
      buttons[i].addEventListener('click', function () {
        var next = isDark() ? 'light' : 'dark';
        root.setAttribute('data-theme', next);
        try {
          localStorage.setItem(KEY, next);
        } catch (e) {
          /* Pinning not possible: the toggle still works for this page. */
        }
        paint();
      });
    }
    paint();
  });
})();
