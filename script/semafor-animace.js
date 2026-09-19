(() => {
  const root = document.getElementById('traffic-demo');
  if (!root) return;
  const SOLUTION_PASSWORD = 'semafor519';
  const phases = [
    {name:'Červená', duration:3000, pins:[1,0,0], description:'Červená LED svítí 3 sekundy. Ostatní LED jsou zhasnuté.'},
    {name:'Červená + žlutá', duration:1000, pins:[1,1,0], description:'Červená a žlutá svítí současně 1 sekundu. Zelená je zhasnutá.'},
    {name:'Zelená', duration:3000, pins:[0,0,1], description:'Zelená LED svítí 3 sekundy. Červená a žlutá jsou zhasnuté.'},
    {name:'Žlutá', duration:1000, pins:[0,1,0], description:'Žlutá LED svítí 1 sekundu. Potom se cyklus vrátí na červenou.'}
  ];
  const q = selector => root.querySelector(selector);
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)');
  let phase = 0, elapsed = 0, running = !reduced.matches, previous = performance.now(), frame = null, renderedPhase = -1;
  function render() {
    const p = phases[phase];
    root.dataset.phase = phase;
    q('[data-time]').textContent = ((p.duration - elapsed) / 1000).toFixed(1).replace('.', ',');
    q('[data-progress]').style.width = (100 * (1 - elapsed / p.duration)) + '%';
    q('[data-play]').textContent = running ? 'Pozastavit' : 'Spustit';
    if (phase === renderedPhase) return;
    renderedPhase = phase;
    q('[data-phase-name]').textContent = p.name;
    q('[data-description]').textContent = p.description;
    p.pins.forEach((value, i) => { q(`[data-pin="${i}"]`).textContent = value ? 'HIGH' : 'LOW'; });
    root.querySelectorAll('[data-phase-label]').forEach(el => el.classList.toggle('active', Number(el.dataset.phaseLabel) === phase));
    root.querySelectorAll('[data-code-phase]').forEach(el => {
      const active = Number(el.dataset.codePhase) === phase;
      el.classList.toggle('active', active);
      if (active && !q('[data-solution]').hidden) {
        const pre = q('pre');
        pre.scrollTop = Math.max(0, el.offsetTop - pre.offsetTop - 35);
      }
    });
  }
  function advance(now) {
    if (running && !document.hidden) {
      elapsed += Math.max(0, now - previous);
      // A full cycle is 8 seconds; discard complete cycles without looping forever.
      elapsed %= 8000;
      while (elapsed >= phases[phase].duration) { elapsed -= phases[phase].duration; phase = (phase + 1) % phases.length; }
    }
    previous = now;
  }
  function tick(now) { frame = null; advance(now); render(); if (running && !document.hidden) frame = requestAnimationFrame(tick); }
  function schedule() {
    if (frame !== null) cancelAnimationFrame(frame);
    previous = performance.now();
    frame = running && !document.hidden ? requestAnimationFrame(tick) : null;
    render();
  }
  q('[data-play]').addEventListener('click', () => { advance(performance.now()); running = !running; schedule(); q('[data-announcement]').textContent = running ? 'Animace spuštěna.' : 'Animace pozastavena.'; });
  q('[data-step]').addEventListener('click', () => { running = false; phase = (phase + 1) % phases.length; elapsed = 0; schedule(); q('[data-announcement]').textContent = phases[phase].description; });
  q('[data-reset]').addEventListener('click', () => { phase = 0; elapsed = 0; schedule(); q('[data-announcement]').textContent = 'Cyklus vrácen na červenou.'; });
  const input = q('#traffic-password'), form = q('[data-form]'), solution = q('[data-solution]');
  function lock() { solution.hidden = true; q('[data-lock-panel]').hidden = false; form.hidden = true; input.value = ''; input.removeAttribute('aria-invalid'); q('#traffic-error').textContent = ''; q('[data-reveal]').setAttribute('aria-expanded','false'); }
  lock();
  q('[data-reveal]').addEventListener('click', () => { form.hidden = !form.hidden; q('[data-reveal]').setAttribute('aria-expanded', String(!form.hidden)); if (!form.hidden) input.focus(); });
  input.addEventListener('input', () => { input.removeAttribute('aria-invalid'); q('#traffic-error').textContent = ''; });
  form.addEventListener('submit', event => {
    event.preventDefault();
    if (input.value !== SOLUTION_PASSWORD) { q('#traffic-error').textContent = 'Nesprávné heslo. Zkus to znovu.'; input.setAttribute('aria-invalid','true'); input.focus(); return; }
    input.value = ''; q('[data-lock-panel]').hidden = true; solution.hidden = false; renderedPhase = -1; render(); q('[data-lock]').focus();
  });
  q('[data-lock]').addEventListener('click', () => { lock(); q('[data-reveal]').focus(); });
  document.addEventListener('visibilitychange', schedule);
  reduced.addEventListener('change', event => { if (event.matches) { advance(performance.now()); running = false; schedule(); } });
  schedule();
})();
