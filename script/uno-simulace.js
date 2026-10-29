/* Blink – propojení SVG LED, stavu HIGH/LOW a zvýraznění kódu. */
(() => {
  'use strict';
  const root = document.getElementById('uno-sim');
  if (!root || root.dataset.blinkInitialized === 'true') return;
  const toggle = root.querySelector('[data-action="toggle"]');
  const reset = root.querySelector('[data-action="reset"]');
  const delayInput = root.querySelector('[data-control="delay"]');
  const state = root.querySelector('[data-value="state"]');
  const remaining = root.querySelector('[data-value="remaining"]');
  const announcement = root.querySelector('[data-value="announcement"]');
  if (![toggle, reset, delayInput, state, remaining].every(Boolean)) return;
  root.dataset.blinkInitialized = 'true';
  const lines = [...root.querySelectorAll('[data-line]')];
  const durationLabels = [...root.querySelectorAll('[data-delay]')];
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)');
  let delay = Number(delayInput.value) || 1000;
  let elapsed = 0;
  let running = !reduced.matches;
  let previous = performance.now();
  let frame = null;

  function draw() {
    const high = elapsed < delay;
    const withinPhase = elapsed % delay;
    const phaseKey = high ? 'high' : 'low';
    // Prvních 180 ms fáze ukaž příkaz digitalWrite(), pak čekání delay().
    const activeLine = withinPhase < Math.min(180, delay * 0.22) ? phaseKey : 'wait-' + phaseKey;
    root.dataset.high = String(high);
    root.dataset.running = String(running);
    state.textContent = high ? 'HIGH · LED svítí' : 'LOW · LED nesvítí';
    remaining.textContent = (running ? 'Čekání: ' : 'Pozastaveno · zbývá ') + Math.ceil((delay - withinPhase) / 10) * 10 + ' ms';
    toggle.textContent = running ? 'Pozastavit' : 'Spustit';
    toggle.setAttribute('aria-pressed', String(running));
    root.querySelectorAll('.uno-led-switch').forEach(led => led.classList.toggle('is-lit', high));
    lines.forEach(line => {
      const active = line.dataset.line === activeLine;
      line.classList.toggle('is-active', active);
      line.classList.toggle('uno-active', active);
    });
  }
  function advance(now) {
    if (running && !document.hidden) elapsed = (elapsed + Math.max(0, now - previous)) % (delay * 2);
    previous = now;
  }
  function tick(now) {
    frame = null;
    advance(now);
    draw();
    if (running && !document.hidden) frame = requestAnimationFrame(tick);
  }
  function schedule() {
    if (frame !== null) cancelAnimationFrame(frame);
    frame = null;
    previous = performance.now();
    draw();
    if (running && !document.hidden) frame = requestAnimationFrame(tick);
  }
  toggle.addEventListener('click', () => {
    advance(performance.now());
    running = !running;
    schedule();
    if (announcement) announcement.textContent = running ? 'Simulace spuštěna.' : 'Simulace pozastavena.';
  });
  reset.addEventListener('click', () => {
    elapsed = 0;
    schedule();
    if (announcement) announcement.textContent = 'Program začíná od HIGH. LED svítí.';
  });
  delayInput.addEventListener('change', () => {
    const number = Number(delayInput.value);
    if (!Number.isFinite(number) || number <= 0) return;
    delay = number;
    elapsed = 0;
    durationLabels.forEach(node => { node.textContent = String(delay); });
    schedule();
    if (announcement) announcement.textContent = 'Nová pauza: ' + delay + ' ms.';
  });
  document.addEventListener('visibilitychange', schedule);
  reduced.addEventListener('change', event => {
    if (event.matches) { advance(performance.now()); running = false; schedule(); }
  });
  durationLabels.forEach(node => { node.textContent = String(delay); });
  schedule();
})();
