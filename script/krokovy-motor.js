(() => {
  'use strict';
  const phaseOf = count => ((count % 4) + 4) % 4;
  const degreesOf = count => count * 360 / 84;
  if (typeof module !== 'undefined') module.exports = { phaseOf, degreesOf };
  if (typeof document === 'undefined') return;
  const root = document.querySelector('#krokovy-motor');
  if (!root) return;
  const get = id => root.querySelector('#principle-' + id);
  const rotor = get('motor-rotor');
  let count = 0, running = false, lastStep = 0, visual = 0;
  let startAngle = 0, targetAngle = 0, started = 0, duration = 180;
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const direction = () => Number(get('direction').value);
  const interval = () => 1000 / Number(get('speed').value);
  const format = n => n.toLocaleString('cs-CZ', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  function renderState() {
    const active = phaseOf(count);
    root.querySelectorAll('[data-pole]').forEach((el,i) => el.classList.toggle('on',i === active));
    root.querySelectorAll('[data-phase]').forEach((el,i) => {
      el.classList.toggle('on',i === active);
      el.querySelector('b').textContent = i === active ? 'ZAPNUTO' : 'VYPNUTO';
    });
    get('active-coil').textContent = active + 1;
    get('count').textContent = count;
    get('angle').textContent = format(((degreesOf(count) % 360) + 360) % 360) + '°';
    get('explanation').textContent = `Cívka ${active + 1} přitahuje zuby rotoru do své polohy. Další krok zapne cívku ${phaseOf(count + direction()) + 1}.`;
    get('run').textContent = running ? 'Pozastavit' : 'Spustit';
    get('run').setAttribute('aria-pressed',String(running));
  }
  function step(now) {
    count += direction();
    startAngle = visual;
    targetAngle = degreesOf(count);
    started = now;
    duration = reduceMotion.matches ? 0 : Math.min(220,interval() * .6);
    renderState();
  }
  function pause() {
    running = false;
    renderState();
    get('status').textContent = 'Pozastaveno. Aktivní cívka zůstává zapnutá.';
  }
  get('run').addEventListener('click',() => {
    if (running) return pause();
    running = true;
    lastStep = performance.now();
    renderState();
    get('status').textContent = 'Motor postupně přepíná cívky.';
  });
  get('step').addEventListener('click',() => {
    pause();
    step(performance.now());
    get('status').textContent = 'Proveden jeden krok.';
  });
  get('reset').addEventListener('click',() => {
    running = false; count = 0; visual = 0; startAngle = 0; targetAngle = 0;
    rotor.setAttribute('transform','rotate(0 320 310)');
    renderState();
    get('status').textContent = 'Výchozí poloha. Cívka 1 je zapnutá.';
  });
  get('direction').addEventListener('change',renderState);
  get('speed').addEventListener('input',() => {
    get('speed-value').textContent = get('speed').value;
    lastStep = performance.now();
  });
  document.addEventListener('visibilitychange',() => { if (document.hidden && running) pause(); });
  function tick(now) {
    if (running && now-lastStep >= interval()) { lastStep = now; step(now); }
    const t = duration === 0 ? 1 : Math.min(1,Math.max(0,(now-started)/duration));
    visual = startAngle + (targetAngle-startAngle) * (t*t*(3-2*t));
    rotor.setAttribute('transform',`rotate(${visual} 320 310)`);
    requestAnimationFrame(tick);
  }
  renderState(); requestAnimationFrame(tick);
})();
