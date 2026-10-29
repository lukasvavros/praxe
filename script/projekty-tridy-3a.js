/* Projekty třídy 3A/B – společný světlý a tmavý režim. */
(() => {
  'use strict';

  const THEME_KEY = 'pra-arduino-theme';
  const root = document.documentElement;

  function savedTheme() {
    try {
      const stored = localStorage.getItem(THEME_KEY);
      if (stored === 'light' || stored === 'dark') return stored;
    } catch (_) {
      // Některé prohlížeče mohou ukládání omezit.
    }
    return window.matchMedia &&
      window.matchMedia('(prefers-color-scheme: dark)').matches
      ? 'dark' : 'light';
  }

  root.dataset.theme = savedTheme();

  function initializeToggle() {
    const button = document.querySelector('.theme-toggle');
    if (!button) return;

    const label = button.querySelector('.theme-label');
    const icon = button.querySelector('[aria-hidden]');

    function update() {
      const dark = root.dataset.theme === 'dark';
      if (label) label.textContent = dark ? 'Světlý režim' : 'Tmavý režim';
      if (icon) icon.textContent = dark ? '☀' : '☾';
      button.setAttribute('aria-pressed', String(dark));
      button.setAttribute('aria-label',
        dark ? 'Přepnout na světlý režim' : 'Přepnout na tmavý režim');
    }

    button.addEventListener('click', () => {
      root.dataset.theme = root.dataset.theme === 'dark' ? 'light' : 'dark';
      try { localStorage.setItem(THEME_KEY, root.dataset.theme); } catch (_) {}
      update();
    });
    update();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeToggle, { once: true });
  } else {
    initializeToggle();
  }
})();
