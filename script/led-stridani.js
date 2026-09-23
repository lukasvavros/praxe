(() => {
  'use strict';
  document.querySelectorAll('[data-led-sequence]').forEach(root => {
    const q = s => root.querySelector(s), all = s => root.querySelectorAll(s);
    const names = {'13':'LED na desce (D13)', '3':'červená LED (D3)', '2':'zelená LED (D2)'};
    let pins = ['13','3'], phase = -1, elapsed = 0, last = 0, timer = null;
    const running = () => timer !== null;
    function draw() {
      const pin = pins[phase];
      all('[data-ls-led]').forEach(el => el.classList.toggle('active', el.dataset.lsLed === pin));
      all('[data-ls-card]').forEach(el => el.classList.toggle('active', el.dataset.lsCard === pin));
      all('[data-ls-value]').forEach(el => el.textContent = el.dataset.lsValue === pin ? 'HIGH · 1' : 'LOW · 0');
      all('[data-ls-phase]').forEach(el => { el.classList.toggle('active', el.dataset.lsPhase === pin); el.hidden = !pins.includes(el.dataset.lsPhase); });
      q('[data-ls-progress]').value = elapsed;
      q('[data-ls-play]').textContent = running() ? 'Pozastavit' : phase < 0 ? 'Spustit' : 'Pokračovat';
      q('[data-ls-status]').textContent = phase < 0 ? 'Připraveno. Spusť animaci nebo vyzkoušej jednotlivé kroky.' : (running() ? 'Svítí ' : 'Pozastaveno · svítí ') + names[pin] + '.';
    }
    function tick() {
      const now = performance.now(); elapsed += now - last; last = now;
      if (elapsed >= 1000) { const steps = Math.floor(elapsed / 1000); phase = (phase + steps) % pins.length; elapsed %= 1000; draw(); }
      q('[data-ls-progress]').value = elapsed;
    }
    function pause() { if (running()) { tick(); clearInterval(timer); timer = null; } draw(); }
    q('[data-ls-play]').addEventListener('click', () => {
      if (running()) { pause(); return; }
      if (phase < 0) phase = 0;
      last = performance.now(); timer = setInterval(tick, 40); draw();
    });
    q('[data-ls-next]').addEventListener('click', () => { pause(); phase = (phase + 1) % pins.length; elapsed = 0; draw(); });
    function reset() { pause(); phase = -1; elapsed = 0; draw(); }
    q('[data-ls-reset]').addEventListener('click', reset);
    q('[data-ls-mode]').addEventListener('change', () => {
      reset(); pins = q('[data-ls-mode]').value === '3' ? ['13','3','2'] : ['13','3'];
      all('[data-ls-code]').forEach(el => el.hidden = el.dataset.lsCode !== String(pins.length));
      q('[data-ls-code-title]').textContent = 'Řešení: ' + (pins.length === 3 ? 'tři LED' : 'dvě LED'); draw();
    });
    document.addEventListener('visibilitychange', () => { if (document.hidden) pause(); });
    const key = 'pra-led-stridani-unlocked';
    function unlock(open) {
      q('[data-ls-solution]').hidden = !open; q('[data-ls-show]').hidden = open;
      q('[data-ls-form]').hidden = true; q('[data-ls-password]').value = ''; q('[data-ls-error]').textContent = '';
    }
    q('[data-ls-show]').addEventListener('click', () => { q('[data-ls-form]').hidden = false; q('[data-ls-password]').focus(); });
    q('[data-ls-form]').addEventListener('submit', e => {
      e.preventDefault();
      if (q('[data-ls-password]').value !== 'led519') { q('[data-ls-error]').textContent = 'Nesprávné heslo.'; return; }
      try { if (q('[data-ls-remember]').checked) localStorage.setItem(key,'yes'); else localStorage.removeItem(key); } catch {}
      unlock(true); q('[data-ls-lock]').focus();
    });
    q('[data-ls-lock]').addEventListener('click', () => {
      try { localStorage.removeItem(key); } catch {}
      q('[data-ls-remember]').checked = false; unlock(false); q('[data-ls-show]').focus();
    });
    let remembered = false; try { remembered = localStorage.getItem(key) === 'yes'; } catch {}
    unlock(remembered); draw();
  });
})();
