(() => {
  const root = document.getElementById('uno-sim');
  if (!root) return;
  const toggle = root.querySelector('[data-action="toggle"]');
  const delayInput = root.querySelector('[data-control="delay"]');
  const state = root.querySelector('[data-value="state"]');
  const remaining = root.querySelector('[data-value="remaining"]');
  const announcement = root.querySelector('[data-value="announcement"]');
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)');
  let delay = 1000, elapsed = 0, running = !reduced.matches;
  let previous = performance.now(), frame = null;
  function render() {
    const high = elapsed < delay;
    root.dataset.high = String(high);
    root.dataset.running = String(running);
    state.textContent = high ? 'HIGH · LED svítí' : 'LOW · LED nesvítí';
    remaining.textContent = `Čekání: ${Math.ceil((delay - elapsed % delay) / 10) * 10} ms`;
    toggle.textContent = running ? 'Pozastavit' : 'Spustit';
    root.querySelectorAll('[data-line]').forEach(line => {
      const active = line.dataset.line === (high ? 'wait-high' : 'wait-low');
      line.classList.toggle('uno-active', active);
    });
  }
  function advance(now) {
    if (running && !document.hidden) elapsed = (elapsed + now - previous) % (delay * 2);
    previous = now;
  }
  function tick(now) {
    frame = null;
    advance(now); render();
    if (running && !document.hidden) frame = requestAnimationFrame(tick);
  }
  function schedule() {
    previous = performance.now();
    if (frame !== null) cancelAnimationFrame(frame);
    frame = running && !document.hidden ? requestAnimationFrame(tick) : null;
    render();
  }
  toggle.addEventListener('click', () => {
    advance(performance.now()); running = !running; schedule();
    announcement.textContent = running ? 'Simulace spuštěna.' : `Simulace pozastavena. ${state.textContent}.`;
  });
  root.querySelector('[data-action="reset"]').addEventListener('click', () => {
    elapsed = 0; schedule(); announcement.textContent = 'Program začíná od HIGH. LED svítí.';
  });
  delayInput.addEventListener('change', () => {
    delay = Number(delayInput.value); elapsed = 0;
    root.querySelectorAll('[data-delay]').forEach(node => { node.textContent = delay; });
    schedule(); announcement.textContent = `Pauza nastavena na ${delay} milisekund. Program začíná od HIGH.`;
  });
  document.addEventListener('visibilitychange', schedule);
  reduced.addEventListener('change', event => {
    if (event.matches) { advance(performance.now()); running = false; schedule(); }
  });
  schedule();
})();
