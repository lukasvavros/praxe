/* Téma animací uvnitř iframe; stejné nastavení jako index a kapitoly. */
(() => {
  'use strict';
  const key = 'pra-arduino-theme';
  const root = document.documentElement;
  function apply() {
    let theme = 'light';
    try { theme = localStorage.getItem(key) === 'dark' ? 'dark' : 'light'; } catch (_) {}
    root.dataset.theme = theme;
  }
  apply();
  window.addEventListener('storage', event => {
    if (event.key === key) apply();
  });
  window.addEventListener('pageshow', apply);
  // Parent page and iframe share the same origin on GitHub Pages.
  window.addEventListener('message', event => {
    if (event.origin !== location.origin) return;
    if (event.data && event.data.type === 'pra-theme-change') apply();
  });
})();
