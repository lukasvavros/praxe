(() => {
  const root = document.getElementById('button-demo');
  if (!root) return;
  // Heslo změňte zde. Jde o výukové skrytí, nikoli serverové zabezpečení.
  const SOLUTION_PASSWORD = 'Arduino2!';
  const lockPanel = root.querySelector('[data-lock-panel]');
  const solution = root.querySelector('[data-solution]');
  const showPassword = root.querySelector('[data-show-password]');
  const form = root.querySelector('[data-password-form]');
  const input = root.querySelector('#button-solution-password');
  const error = root.querySelector('#button-password-error');
  const rememberKey = 'pra-button-solution-unlocked';
  const rememberLabel = document.createElement('label');
  const rememberBox = document.createElement('input');
  rememberBox.type = 'checkbox';
  rememberBox.name = 'remember-solution';
  rememberLabel.className = 'solution-remember';
  rememberLabel.append(rememberBox, document.createTextNode(' Zapamatovat v tomto prohlížeči'));
  form.insertBefore(rememberLabel, error);
  function rememberUnlock(value) {
    try { if (value) localStorage.setItem(rememberKey, 'yes'); else localStorage.removeItem(rememberKey); } catch {}
  }
  function hasRememberedUnlock() {
    try { return localStorage.getItem(rememberKey) === 'yes'; } catch { return false; }
  }
  const unlockStatus = root.querySelector('[data-unlock-status]');
  function lockSolution() {
    solution.hidden = true;
    lockPanel.hidden = false;
    form.hidden = true;
    input.value = '';
    input.removeAttribute('aria-invalid');
    error.textContent = '';
    showPassword.setAttribute('aria-expanded', 'false');
  }
  lockSolution();
  if (hasRememberedUnlock()) {
    rememberBox.checked = true; lockPanel.hidden = true; solution.hidden = false;
    unlockStatus.textContent = 'Řešení je odemknuté v tomto prohlížeči.';
  }
  root.querySelector('[data-lock-solution]').textContent = 'Skrýt a zapomenout odemknutí';
  showPassword.addEventListener('click', () => {
    form.hidden = !form.hidden;
    showPassword.setAttribute('aria-expanded', String(!form.hidden));
    if (!form.hidden) input.focus();
  });
  input.addEventListener('input', () => {
    error.textContent = '';
    input.removeAttribute('aria-invalid');
  });
  form.addEventListener('submit', event => {
    event.preventDefault();
    if (input.value !== SOLUTION_PASSWORD) {
      error.textContent = 'Nesprávné heslo. Zkus to znovu.';
      input.setAttribute('aria-invalid', 'true');
      input.focus();
      return;
    }
    rememberUnlock(rememberBox.checked);
    input.value = '';
    error.textContent = '';
    lockPanel.hidden = true;
    solution.hidden = false;
    unlockStatus.textContent = 'Řešení je zobrazené. Zvýrazněný řádek odpovídá stavu tlačítka.';
    root.querySelector('[data-lock-solution]').focus();
  });
  root.querySelector('[data-lock-solution]').addEventListener('click', () => {
    rememberUnlock(false); rememberBox.checked = false;
    lockSolution();
    unlockStatus.textContent = 'Řešení je opět skryté.';
    showPassword.focus();
  });
  const holds = new Set();
  const controls = root.querySelectorAll('[data-hold]');
  function render() {
    const pressed = holds.size > 0;
    root.dataset.pressed = String(pressed);
    root.querySelector('[data-input]').textContent = pressed ? 'LOW · 0' : 'HIGH · 1';
    root.querySelector('[data-output]').textContent = pressed ? 'HIGH · 1' : 'LOW · 0';
    root.querySelector('[data-state]').textContent = pressed ? 'Tlačítko stisknuté → LED svítí.' : 'Tlačítko uvolněné → LED nesvítí.';
    root.querySelector('[data-why]').textContent = pressed ? 'Sepnutý kontakt spojí D2 se zemí (GND). Vstup má LOW, podmínka platí a D8 se nastaví na HIGH.' : 'Vnitřní pull-up rezistor drží nestisknutý vstup D2 na HIGH.';
    root.querySelector('[data-monitor]').textContent = pressed ? 'Tlačítko stisknuto' : 'Tlačítko uvolněno';
    root.querySelector('[data-branch="on"]').classList.toggle('active', pressed);
    root.querySelector('[data-branch="off"]').classList.toggle('active', !pressed);
  }
  function clear() { holds.clear(); render(); }
  controls.forEach((button, index) => {
    button.addEventListener('pointerdown', event => {
      if (event.button !== 0) return;
      button.setPointerCapture(event.pointerId);
      holds.add('p' + event.pointerId); render();
    });
    for (const type of ['pointerup', 'pointercancel', 'lostpointercapture']) button.addEventListener(type, event => { holds.delete('p' + event.pointerId); render(); });
    button.addEventListener('keydown', event => {
      if (event.key !== ' ' && event.key !== 'Enter') return;
      event.preventDefault(); holds.add('k' + index + event.key); render();
    });
    button.addEventListener('keyup', event => {
      if (event.key !== ' ' && event.key !== 'Enter') return;
      event.preventDefault(); holds.delete('k' + index + event.key); render();
    });
    button.addEventListener('blur', clear);
    button.addEventListener('contextmenu', event => event.preventDefault());
  });
  window.addEventListener('blur', clear);
  document.addEventListener('visibilitychange', () => { if (document.hidden) clear(); });
  render();
})();
