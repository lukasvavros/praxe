/* Jednotný přepínač vzhledu sdílený s index.html. */
(() => {
  'use strict';
  const root = document.documentElement;
  const button = document.querySelector('.site-topbar .theme-toggle');
  if (!button) return;
  const key = 'pra-arduino-theme';
  const label = button.querySelector('.theme-label');
  const icon = button.querySelector('[aria-hidden="true"]');
  function update() {
    const dark = root.dataset.theme === 'dark';
    label.textContent = dark ? 'Světlý režim' : 'Tmavý režim';
    icon.textContent = dark ? '☀' : '☾';
    button.setAttribute('aria-pressed', String(dark));
    button.setAttribute('aria-label', dark ? 'Přepnout na světlý režim' : 'Přepnout na tmavý režim');
  }
  button.addEventListener('click', () => {
    root.dataset.theme = root.dataset.theme === 'dark' ? 'light' : 'dark';
    try { localStorage.setItem(key, root.dataset.theme); } catch (_) {}
    update();
  });
  update();
})();
