(() => {
  'use strict';
  document.querySelectorAll('[data-serial-demo]').forEach(root => {
    const q = s => root.querySelector(s), all = s => root.querySelectorAll(s);
    function paintLed(el, on) {
      const pin = el.getAttribute('data-ls-led');
      el.classList.toggle('active', on);
      if (pin === '13') {
        el.setAttribute('fill', on ? '#fff17a' : '#807044');
        return;
      }
      const color = pin === '3' ? (on ? '#ff3028' : '#521c21') : (on ? '#35ff79' : '#173f2b');
      // Change the actual SVG lens, not just a CSS filter on its group.
      el.querySelectorAll('[id*="color_"]').forEach(shape => {
        shape.setAttribute('fill', color);
        if (shape.id.endsWith('color_path32')) shape.setAttribute('opacity', on ? '0.95' : '0.88');
      });
    }
    let mode = 1, step = -1, duration = 1000, elapsed = 0, last = 0, timer = null, done = false, lines = [], description = '';
    const tips = {
      1:'Každá změna stavu LED vytvoří jeden nový řádek v monitoru.',
      2:'Proměnná byte má rozsah 0–255. Začínáme na 250: po hodnotě 255 následuje 0. Výpis pokračuje dál.',
      3:'Obě krajní hodnoty patří do výpisu. Celkem se zobrazí 16 čísel.',
      4:'Proměnná int může obsahovat i záporná čísla. Celkem se zobrazí 16 čísel.',
      5:'Přírůstek je 2. Vypíše se 10 sudých čísel.',
      6:'Průběh ukazuje počítadlo nad monitorem. Tento program nic přes Serial nevypisuje. Po skončení LED zůstane zhasnutá.'
    };
    function led(on) {
      all('[data-ls-led]').forEach(el => paintLed(el, on && el.getAttribute('data-ls-led') === '3'));
      q('[data-sr-led]').textContent = on ? 'HIGH · 1' : 'LOW · 0';
    }
    function log(value) {
      lines.push(String(value)); if (lines.length > 120) lines.shift();
      const output = q('[data-sr-output]'); output.textContent = lines.join('\n'); output.scrollTop = output.scrollHeight;
    }
    function stop() { if (timer !== null) clearInterval(timer); timer = null; }
    function draw() {
      q('[data-sr-play]').textContent = done ? 'Spustit znovu' : timer !== null ? 'Pozastavit' : step < 0 ? 'Spustit' : 'Pokračovat';
      q('[data-sr-next]').disabled = done;
      q('[data-sr-status]').textContent = (step >= 0 && timer === null && !done ? 'Pozastaveno · ' : '') + description;
      q('[data-sr-progress]').max = duration; q('[data-sr-progress]').value = elapsed;
      q('[data-sr-timing]').textContent = done ? 'Dokončeno' : step < 0 ? 'Připraveno ke spuštění' : 'Do dalšího kroku: ' + ((duration-elapsed)/1000).toFixed(1).replace('.',',') + ' s';
    }
    function advance() {
      step++; elapsed = 0; led(false); q('[data-sr-value]').classList.remove('sr-overflow');
      if (mode === 1) {
        duration = 1000; const on = step % 2 === 0; led(on); log(on ? 'svítí' : 'nesvítí');
        q('[data-sr-value]').textContent = String(step+1); description = on ? 'Červená LED svítí.' : 'Červená LED nesvítí.';
      } else if (mode === 2) {
        duration = 500; const value = (250 + step) % 256; log(value); q('[data-sr-value]').textContent = String(value);
        const overflow = step > 0 && value === 0; q('[data-sr-value]').classList.toggle('sr-overflow',overflow);
        description = overflow ? 'Přetečení: 255 + 1 → 0.' : 'Proměnná se při dalším kroku zvýší o 1.';
      } else if (mode <= 5) {
        duration = 500; const limit = mode === 5 ? 10 : 16;
        if (step >= limit) { done = true; stop(); description = 'Výpis dokončen. Cyklus se neopakuje.'; elapsed = duration; }
        else { const value = mode === 3 ? step : mode === 4 ? 10-step : 2+2*step; log(value); q('[data-sr-value]').textContent = String(value); description = 'Výpis '+(step+1)+' z '+limit+'.'; }
      } else {
        if (step === 0) { duration = 2000; q('[data-sr-value]').textContent = '0 / 25'; description = 'Čekání 2 sekundy. LED je zhasnutá.'; }
        else if (step === 1) { duration = 1000; led(true); description = 'LED svítí 1 sekundu.'; }
        else if (step < 52) {
          duration = 200; const n = Math.floor((step-2)/2)+1, on = step % 2 === 0; led(on);
          q('[data-sr-value]').textContent = n+' / 25'; description = 'Bliknutí '+n+' z 25 · '+(on?'svítí':'nesvítí')+'.';
        } else { done = true; stop(); elapsed = duration; description = 'Hotovo: 25 bliknutí. LED zůstává zhasnutá.'; }
      }
      draw();
    }
    function tick() {
      const now = performance.now(); let rest = elapsed + now-last; last = now;
      while (!done && rest >= duration) { rest -= duration; advance(); }
      if (!done) elapsed = rest;
      draw();
    }
    function pause() { if (timer !== null) tick(); stop(); draw(); }
    function reset() {
      stop(); step = -1; elapsed = 0; done = false; lines = []; duration = 1000;
      q('[data-sr-output]').textContent = ''; q('[data-sr-value]').textContent = '—'; q('[data-sr-value]').classList.remove('sr-overflow');
      q('[data-sr-tip]').textContent = tips[mode]; q('[data-sr-value-label]').textContent = mode === 6 ? 'Počítadlo bliknutí' : mode === 1 ? 'Krok' : 'Hodnota';
      description = 'Připraveno. Spusť animaci nebo použij Další krok.'; led(false); draw();
    }
    q('[data-sr-play]').addEventListener('click', () => {
      if (timer !== null) { pause(); return; }
      if (done) reset();
      if (step < 0) advance();
      last = performance.now(); timer = setInterval(tick,40); draw();
    });
    q('[data-sr-next]').addEventListener('click', () => { pause(); if (!done) advance(); });
    q('[data-sr-reset]').addEventListener('click',reset);
    q('[data-sr-mode]').addEventListener('change', () => { mode = Number(q('[data-sr-mode]').value); reset(); all('[data-sr-code]').forEach(el=>el.hidden=Number(el.dataset.srCode)!==mode); });
    document.addEventListener('visibilitychange', () => { if(document.hidden) pause(); });
    const key='pra-serial-exercises-unlocked';
    function unlock(open) { q('[data-sr-solution]').hidden=!open; q('[data-sr-show]').hidden=open; q('[data-sr-form]').hidden=true; q('[data-sr-password]').value=''; q('[data-sr-error]').textContent=''; }
    q('[data-sr-show]').addEventListener('click',()=>{q('[data-sr-form]').hidden=false;q('[data-sr-password]').focus();});
    q('[data-sr-form]').addEventListener('submit',e=>{
      e.preventDefault();if(q('[data-sr-password]').value!=='led519'){q('[data-sr-error]').textContent='Nesprávné heslo.';return;}
      try{if(q('[data-sr-remember]').checked)localStorage.setItem(key,'yes');else localStorage.removeItem(key);}catch{}
      unlock(true);q('[data-sr-lock]').focus();
    });
    q('[data-sr-lock]').addEventListener('click',()=>{try{localStorage.removeItem(key);}catch{}q('[data-sr-remember]').checked=false;unlock(false);q('[data-sr-show]').focus();});
    let remembered=false;try{remembered=localStorage.getItem(key)==='yes';}catch{}unlock(remembered);reset();
  });
})();
