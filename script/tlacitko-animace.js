(() => {
  const root = document.getElementById('button-demo');
  if (!root) return;
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
