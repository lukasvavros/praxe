/* Kapitola 6: společný model měření a ovládání výukových ukázek. */
(function () {
  'use strict';
  const limitFromADC = raw => 10 + Math.floor(Math.max(0, Math.min(1023, Number(raw))) * 30 / 1023);
  function initialState() { return { temperature: null, humidity: null, minimum: null, maximum: null, valid: false, samples: 0 }; }
  function measure(state, temperature, humidity, error) {
    if (error) return { ...state, valid: false, samples: state.samples + 1 };
    return { temperature, humidity, valid: true, samples: state.samples + 1,
      minimum: state.minimum === null ? temperature : Math.min(state.minimum, temperature),
      maximum: state.maximum === null ? temperature : Math.max(state.maximum, temperature) };
  }
  function alarmState(state, limit) { return !state.valid ? 'error' : state.temperature > limit ? 'warning' : 'ok'; }
  if (typeof module !== 'undefined' && module.exports) module.exports = { limitFromADC, initialState, measure, alarmState };
  if (typeof document === 'undefined') return;
  const q = id => document.getElementById(id);
  if (!q('sim-mode')) return;
  const flowText = ['Arduino vyvolá komunikaci s čidlem na D2.', 'Čidlo předá digitální údaje o vlhkosti a teplotě. Knihovna zajišťuje časování přenosu.', 'Knihovna ověří přenos. Při DHTLIB_OK smíme hodnoty použít; při chybě zobrazíme hlášení.', 'Program vypíše platné údaje, případně aktualizuje extrémy a porovná teplotu s limitem.'];
  let flow = 0;
  function paintFlow() { [...q('dht-flow').children].forEach((node, i) => { node.classList.toggle('active', i === flow); if(i === flow) node.setAttribute('aria-current', 'step'); else node.removeAttribute('aria-current'); }); q('flow-text').textContent = flowText[flow]; }
  q('flow-next').addEventListener('click', () => { flow = (flow + 1) % 4; paintFlow(); });
  q('flow-reset').addEventListener('click', () => { flow = 0; paintFlow(); });
  paintFlow();
  let state = initialState(), timer = null, flashTimer = null;
  const history = [];
  const motion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const temp = () => Number(q('sim-temp').value), hum = () => Number(q('sim-hum').value), limit = () => limitFromADC(q('sim-pot').value);
  function setLCD(a, b) { [a,b].forEach((text,row)=>{ [...q('svg-lcd'+(row+1)).querySelectorAll('text')].forEach((cell,i)=>cell.textContent=text[i]||' '); }); }
  function paintMeasurement() {
    const mode = q('sim-mode').value, l = limit();
    q('env-temp').textContent = temp() + ' °C'; q('env-hum').textContent = hum() + ' % RH';
    q('limit-value').textContent = l + ' °C'; q('pot-adc').textContent = 'ADC ' + q('sim-pot').value + ' / 1023 → limit ' + l + ' °C';
    q('schema-pot').classList.toggle('is-hidden', mode !== 'alarm');
    q('pot-controls').hidden = mode !== 'alarm'; q('alarm-status').hidden = mode !== 'alarm'; q('extremes').hidden = mode !== 'minmax';
    q('schema-lcd').classList.toggle('is-hidden', mode === 'serial');
    q('read-temp').textContent = state.valid ? state.temperature + ' °C' : '— °C';
    q('read-hum').textContent = state.valid ? state.humidity + ' % RH' : '— % RH';
    q('read-min').textContent = state.minimum === null ? '— °C' : state.minimum + ' °C';
    q('read-max').textContent = state.maximum === null ? '— °C' : state.maximum + ' °C';
    const alarm = alarmState(state,l);
    q('alarm-status').className = 'dht-status ' + (state.samples ? alarm : '');
    q('alarm-status').textContent = !state.samples ? 'Nejprve proveďte měření.' : alarm === 'error' ? 'Chyba čtení – teplotu nelze vyhodnotit.' : alarm === 'warning' ? 'Varování: teplota překročila limit.' : 'Teplota nepřekračuje limit.';
    if (!state.samples) setLCD('Cekam na mereni', '');
    else if (!state.valid) setLCD('Chyba cidla', 'Zkontroluj DATA');
    else if (mode === 'minmax') setLCD('T:' + state.temperature + ' C', 'Min:' + state.minimum + ' Max:' + state.maximum);
    else if (mode === 'alarm') setLCD('T:' + state.temperature + 'C L:' + l + 'C', alarm === 'warning' ? 'POZOR: T > LIMIT' : 'V poradku');
    else if (mode === 'custom') setLCD('Teplota: '+String(state.temperature).padStart(2,' ')+'  C', 'Vlhkost: '+state.humidity+' %');
    else setLCD('Teplota: '+state.temperature+' C', 'Vlhkost: '+state.humidity+' %');
    q('dht-custom-glyph').classList.toggle('is-hidden', mode !== 'custom' || !state.valid);
  }
  function sample() {
    state = measure(state, temp(), hum(), q('sim-error').checked);
    history.push(`${String(state.samples).padStart(2,'0')} | ` + (state.valid ? `Teplota: ${state.temperature} C | Vlhkost: ${state.humidity} %` : 'CHYBA CTENI – hodnoty nepouzity'));
    if (history.length > 12) history.shift();
    q('serial-log').textContent = history.join('\n'); q('serial-log').scrollTop = q('serial-log').scrollHeight;
    q('measurement-status').textContent = state.valid ? `Odečet ${state.samples}: platné měření. Další změna prostředí se projeví při příštím čtení.` : `Odečet ${state.samples}: chyba. Extrémy zůstávají zachované.`;
    q('measurement-status').className = 'dht-status' + (state.valid ? '' : ' error');
    clearTimeout(flashTimer);
    q('data-dot').setAttribute('opacity', motion.matches ? '0' : '1');
    flashTimer = setTimeout(() => q('data-dot').setAttribute('opacity', '0'), 350);
    paintMeasurement();
  }
  function stop() { clearInterval(timer); timer = null; q('sim-play').textContent = 'Spustit měření'; }
  q('sim-play').addEventListener('click', () => { if (timer !== null) { stop(); q('measurement-status').textContent = 'Měření pozastaveno. Zobrazené údaje zůstávají zachované.'; } else { sample(); timer = setInterval(sample,2000); q('sim-play').textContent = 'Pozastavit'; } });
  q('sim-step').addEventListener('click', () => { stop(); sample(); });
  q('sim-reset').addEventListener('click', () => { stop(); clearTimeout(flashTimer); q('data-dot').setAttribute('opacity','0'); state = initialState(); history.length = 0; q('serial-log').textContent = 'Čekám na první odečet.'; q('measurement-status').textContent = 'Reset dokončen. Připraveno na první odečet.'; q('measurement-status').className='dht-status'; paintMeasurement(); });
  ['sim-temp','sim-hum','sim-pot'].forEach(id => q(id).addEventListener('input',paintMeasurement));
  q('sim-mode').addEventListener('change',()=>{stop();paintMeasurement();});
  document.addEventListener('visibilitychange', () => { if (document.hidden && timer !== null) { stop(); q('measurement-status').textContent = 'Měření je pozastavené.'; } });
  paintMeasurement();
  // SHA-256 gate; remembered locally on this device, as in earlier chapters.
  const expectedHash = '213aa73d0709ab739aacc4280672237eae9fe49546fdb4a598c58b4e54a0a240', storageKey = 'pra-dht11-solutions-v1';
  function remember(value) { try { if(value) localStorage.setItem(storageKey,'yes'); else localStorage.removeItem(storageKey); } catch {} }
  function openSolutions() { q('solution-form').hidden = true; q('solution-content').hidden = false; }
  try { if(localStorage.getItem(storageKey) === 'yes') openSolutions(); } catch {}
  q('solution-form').addEventListener('submit', async event => {
    event.preventDefault();
    if (!window.crypto?.subtle) { q('solution-error').textContent = 'Odemčení otevřete přes HTTPS nebo místní webový server.'; return; }
    try {
      const bytes = await window.crypto.subtle.digest('SHA-256',new TextEncoder().encode(q('solution-password').value));
      const hash = Array.from(new Uint8Array(bytes),byte => byte.toString(16).padStart(2,'0')).join('');
      if(hash !== expectedHash) { q('solution-error').textContent = 'Nesprávné heslo. Zkuste to znovu.'; return; }
      remember(q('solution-remember').checked); q('solution-password').value = ''; q('solution-error').textContent = ''; openSolutions(); q('solution-lock').focus();
    } catch { q('solution-error').textContent = 'Odemčení se nezdařilo. Zkuste to znovu.'; }
  });
  q('solution-lock').addEventListener('click', () => { remember(false); q('solution-form').hidden = false; q('solution-content').hidden = true; q('solution-remember').checked = false; q('solution-password').focus(); });
})();
